import { v } from "convex/values";
import { mutation, query, internalAction, internalMutation, internalQuery, MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

export const sendTextMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    senderId: v.id("participants"),
    text: v.string(),
    replyToId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") throw new Error("Room is closed");

    const text = args.text.trim();
    if (!text) throw new Error("Message cannot be empty");
    if (text.length > 2000) throw new Error("Message too long (max 2000 characters)");

    const participants = await ctx.db
      .query("participants")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();

    const now = Date.now();

    const messageId = await ctx.db.insert("messages", {
      roomId: args.roomId,
      senderId: args.senderId,
      kind: "text",
      status: "pending",
      text,
      replyToId: args.replyToId,
      createdAt: now,
    });

    // Always translate server-side (EN↔JA + romaji)
    await ctx.scheduler.runAfter(0, internal.messages.translateMessageServerSide, {
      messageId,
      roomId: args.roomId,
    });

    return messageId;
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const sendImageMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    senderId: v.id("participants"),
    storageId: v.id("_storage"),
    replyToId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") throw new Error("Room is closed");

    const mediaUrl = await ctx.storage.getUrl(args.storageId);
    if (!mediaUrl) throw new Error("Failed to get file URL");

    return await ctx.db.insert("messages", {
      roomId: args.roomId,
      senderId: args.senderId,
      kind: "image",
      status: "processed",
      mediaUrl,
      replyToId: args.replyToId,
      createdAt: Date.now(),
      processedAt: Date.now(),
    });
  },
});

const AUDIO_MIN_MS = 300;
const AUDIO_MAX_MS = 180_000;
const AUDIO_MAX_BYTES = 12 * 1024 * 1024;
const WAVEFORM_MAX_BARS = 64;

async function insertAudioMessage(
  ctx: MutationCtx,
  args: {
    roomId: Id<"rooms">;
    senderId: Id<"participants">;
    storageId: Id<"_storage">;
    durationMs: number;
    waveform: number[];
    text?: string;
    lang?: "en" | "ja";
    replyToId?: Id<"messages">;
  }
): Promise<Id<"messages">> {
  const room = await ctx.db.get(args.roomId);
  if (!room) throw new Error("Room not found");
  if (room.status === "closed") throw new Error("Room is closed");
  const sender = await ctx.db.get(args.senderId);
  if (!sender || sender.roomId !== args.roomId) throw new Error("Not a member of this room");

  const file = await ctx.db.system.get(args.storageId);
  if (!file) throw new Error("Upload not found");
  if (file.size > AUDIO_MAX_BYTES) throw new Error("Voice message too large");
  if (file.contentType && !file.contentType.startsWith("audio/")) throw new Error("Not an audio file");

  const durationMs = Math.round(args.durationMs);
  if (durationMs < AUDIO_MIN_MS) throw new Error("Voice message too short");
  if (durationMs > AUDIO_MAX_MS) throw new Error("Voice message too long (max 3 minutes)");

  const mediaUrl = await ctx.storage.getUrl(args.storageId);
  if (!mediaUrl) throw new Error("Failed to get file URL");

  const waveform = args.waveform
    .slice(0, WAVEFORM_MAX_BARS)
    .map((p) => Math.round(Math.min(1, Math.max(0, Number.isFinite(p) ? p : 0)) * 100) / 100);
  const text = args.text?.trim().slice(0, 2000) || undefined;
  const now = Date.now();

  const messageId = await ctx.db.insert("messages", {
    roomId: args.roomId,
    senderId: args.senderId,
    kind: "audio",
    // The transcript goes through the same translation pipeline as a text message
    status: text ? "pending" : "processed",
    text,
    mediaUrl,
    audioStorageId: args.storageId,
    durationMs,
    waveform,
    replyToId: args.replyToId,
    createdAt: now,
    processedAt: text ? undefined : now,
  });

  if (text) {
    await ctx.scheduler.runAfter(0, internal.messages.translateMessageServerSide, {
      messageId,
      roomId: args.roomId,
    });
  } else if (waveform.length > 0) {
    // No live transcript (Android can't recognize while recording); an empty waveform means silence
    await ctx.scheduler.runAfter(0, internal.messages.transcribeAudio, {
      messageId,
      storageId: args.storageId,
      lang: args.lang,
    });
  }
  return messageId;
}

const langValidator = v.union(v.literal("en"), v.literal("ja"));

export const sendAudioMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    senderId: v.id("participants"),
    storageId: v.id("_storage"),
    durationMs: v.number(),
    waveform: v.array(v.number()),
    text: v.optional(v.string()),
    lang: v.optional(langValidator),
    replyToId: v.optional(v.id("messages")),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => await insertAudioMessage(ctx, args),
});

const GROQ_TRANSCRIBE_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
/** Whisper invents text for silence; segments it rates as probably not speech are dropped */
const MAX_NO_SPEECH_PROB = 0.6;

function audioExtension(contentType: string): string {
  if (contentType.includes("wav")) return "wav";
  if (contentType.includes("webm")) return "webm";
  if (contentType.includes("ogg")) return "ogg";
  if (contentType.includes("mpeg")) return "mp3";
  return "m4a";
}

/** Stock lines Whisper hallucinates from video-subtitle training data, often at high confidence */
const HALLUCINATIONS = /ご視聴ありがとうございました|チャンネル登録|thanks? (you )?for watching|subscribe to/i;

type WhisperResponse = {
  text?: string;
  language?: string;
  segments?: { text: string; start: number; end: number; avg_logprob?: number; no_speech_prob?: number }[];
};

async function whisper(apiKey: string, audio: Blob, language?: "en" | "ja"): Promise<WhisperResponse | null> {
  const form = new FormData();
  // Groq picks the decoder from the file extension
  form.append("file", audio, `voice.${audioExtension(audio.type)}`);
  form.append("model", "whisper-large-v3-turbo");
  form.append("response_format", "verbose_json");
  form.append("temperature", "0");
  if (language) form.append("language", language);
  const response = await fetch(GROQ_TRANSCRIBE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  if (!response.ok) {
    console.error("Groq transcription failed", response.status, (await response.text()).slice(0, 300));
    return null;
  }
  return (await response.json()) as WhisperResponse;
}

function speechSegments(data: WhisperResponse) {
  return (data.segments ?? []).filter(
    (s) => (s.no_speech_prob ?? 0) < MAX_NO_SPEECH_PROB && !HALLUCINATIONS.test(s.text)
  );
}

function transcriptOf(data: WhisperResponse): string | null {
  const text = data.segments ? speechSegments(data).map((s) => s.text).join("") : (data.text ?? "");
  return text.trim() || null;
}

/** Duration-weighted log probability of the kept segments; higher means Whisper is surer */
function confidence(data: WhisperResponse): number {
  const segments = speechSegments(data);
  const duration = segments.reduce((sum, s) => sum + (s.end - s.start), 0);
  if (!duration) return -Infinity;
  return segments.reduce((sum, s) => sum + (s.avg_logprob ?? -10) * (s.end - s.start), 0) / duration;
}

/**
 * The speaker's language setting is a poor hint (people mix both languages, and a forced language
 * makes Whisper transliterate the other one), so detect it, staying within English and Japanese.
 */
async function transcribeWithGroq(apiKey: string, audio: Blob): Promise<string | null> {
  const detected = await whisper(apiKey, audio);
  if (!detected) return null;
  const language = detected.language?.toLowerCase();
  if (language === "english" || language === "japanese") return transcriptOf(detected);

  // Short or noisy clips get misdetected; force each app language and keep the likelier reading
  const forced = (await Promise.all([whisper(apiKey, audio, "en"), whisper(apiKey, audio, "ja")])).filter(
    (r): r is WhisperResponse => r !== null
  );
  forced.sort((a, b) => confidence(b) - confidence(a));
  return forced[0] ? transcriptOf(forced[0]) : null;
}

export const transcribeAudio = internalAction({
  args: {
    messageId: v.id("messages"),
    storageId: v.id("_storage"),
    lang: v.optional(langValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn("GROQ_API_KEY not set; voice message left without a transcript");
      return null;
    }
    const stored = await ctx.storage.get(args.storageId);
    if (!stored) return null;
    // Storage blobs stream once; transcription may upload the clip several times
    const audio = new Blob([await stored.arrayBuffer()], { type: stored.type });
    const text = await transcribeWithGroq(apiKey, audio);
    if (text) await ctx.runMutation(internal.messages.applyTranscript, { messageId: args.messageId, text });
    return null;
  },
});

export const checkDictationClip = internalQuery({
  args: { roomId: v.id("rooms"), senderId: v.id("participants"), storageId: v.id("_storage") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.status === "closed") throw new Error("Room is closed");
    const sender = await ctx.db.get(args.senderId);
    if (!sender || sender.roomId !== args.roomId) throw new Error("Not a member of this room");
    const file = await ctx.db.system.get(args.storageId);
    if (!file) throw new Error("Upload not found");
    if (file.size > AUDIO_MAX_BYTES) throw new Error("Recording too large");
    return null;
  },
});

/** Dictation text for a device whose speech recognizer is unusable (iOS 26 simulator); the clip is deleted after */
export const transcribeDictation = internalAction({
  args: { roomId: v.id("rooms"), senderId: v.id("participants"), storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    try {
      await ctx.runQuery(internal.messages.checkDictationClip, args);
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) return null;
      const stored = await ctx.storage.get(args.storageId);
      if (!stored) return null;
      const audio = new Blob([await stored.arrayBuffer()], { type: stored.type });
      return await transcribeWithGroq(apiKey, audio);
    } finally {
      await ctx.storage.delete(args.storageId).catch(() => undefined);
    }
  },
});

/** Gives a voice message its server-made transcript and sends it through translation like typed text */
export const applyTranscript = internalMutation({
  args: { messageId: v.id("messages"), text: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message || message.kind !== "audio" || message.text) return null;
    await ctx.db.patch(args.messageId, {
      text: args.text.slice(0, 2000),
      status: "pending",
      processedAt: undefined,
    });
    await ctx.scheduler.runAfter(0, internal.messages.translateMessageServerSide, {
      messageId: args.messageId,
      roomId: message.roomId,
    });
    return null;
  },
});

/** Deletes every voice clip in a room once it closes; transcripts and translations stay. */
export const purgeRoomAudio = internalMutation({
  args: { roomId: v.id("rooms") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();
    for (const m of messages) {
      if (m.kind !== "audio" || !m.audioStorageId) continue;
      await ctx.storage.delete(m.audioStorageId);
      await ctx.db.patch(m._id, { audioStorageId: undefined, mediaUrl: undefined });
    }
    return null;
  },
});

export const sendDrawingMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    senderId: v.id("participants"),
    mediaUrl: v.string(),
    replyToId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status === "closed") throw new Error("Room is closed");

    return await ctx.db.insert("messages", {
      roomId: args.roomId,
      senderId: args.senderId,
      kind: "drawing",
      status: "processed", // drawings don't need text processing
      mediaUrl: args.mediaUrl,
      replyToId: args.replyToId,
      createdAt: Date.now(),
      processedAt: Date.now(),
    });
  },
});

/**
 * The server action and the iOS host both process every message, so results arrive twice and in
 * either order. The first translation wins; a later result only fills in a message that has none.
 */
async function applyProcessedResult(
  ctx: MutationCtx,
  messageId: Id<"messages">,
  processing: NonNullable<Doc<"messages">["processing"]>
) {
  const message = await ctx.db.get(messageId);
  if (!message) return;
  if (message.status !== "pending") {
    const alreadyTranslated = message.status === "processed" && !!message.processing?.translatedText;
    if (alreadyTranslated || !processing.translatedText) return;
  }
  await ctx.db.patch(messageId, {
    status: "processed",
    processing,
    processedAt: Date.now(),
  });
}

/** A failure only counts while the message is still pending: it must never replace a finished result */
async function applyProcessingFailure(ctx: MutationCtx, messageId: Id<"messages">, error: string) {
  const message = await ctx.db.get(messageId);
  if (!message || message.status !== "pending") return;
  await ctx.db.patch(messageId, {
    status: "failed",
    processing: { error },
    processedAt: Date.now(),
  });
}

export const submitProcessedMessage = mutation({
  args: {
    messageId: v.id("messages"),
    processing: v.object({
      translatedText: v.optional(v.string()),
      romaji: v.optional(v.string()),
      suggestions: v.optional(v.array(v.string())),
      error: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await applyProcessedResult(ctx, args.messageId, args.processing);
  },
});

export const markMessageFailed = mutation({
  args: {
    messageId: v.id("messages"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    await applyProcessingFailure(ctx, args.messageId, args.error);
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    // Delete associated reactions
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
      .collect();
    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    if (message.audioStorageId) await ctx.storage.delete(message.audioStorageId);
    await ctx.db.delete(args.messageId);
  },
});

export const getRoomMessages = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_roomId_createdAt", (q) => q.eq("roomId", args.roomId))
      .collect();
  },
});

export const getMessageById = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.messageId);
  },
});

export const getPendingMessagesForProcessor = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_roomId_status", (q) =>
        q.eq("roomId", args.roomId).eq("status", "pending")
      )
      .collect();
  },
});

// --- Server-side translation (fallback when no iOS host is online) ---

function detectLanguage(text: string): "en" | "ja" {
  const cjkRegex = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]/;
  return cjkRegex.test(text) ? "ja" : "en";
}

async function callClaude(apiKey: string, prompt: string, maxTokens = 512): Promise<string | null> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.content?.[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}

export const translateMessageServerSide = internalAction({
  args: {
    messageId: v.id("messages"),
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.runQuery(
      internal.messages.getMessageByIdInternal,
      { messageId: args.messageId }
    );
    if (!message || message.status !== "pending" || !message.text) return;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      await ctx.runMutation(internal.messages.markMessageFailedInternal, {
        messageId: args.messageId,
        error: "Translation unavailable (no API key)",
      });
      return;
    }

    const text = message.text;
    const sourceLang = detectLanguage(text);
    const targetLang = sourceLang === "ja" ? "en" : "ja";
    const fromName = sourceLang === "ja" ? "Japanese" : "English";
    const toName = targetLang === "ja" ? "Japanese" : "English";

    // Translate
    const translatedText = await callClaude(
      apiKey,
      `Translate the following ${fromName} text to ${toName}. Output only the translation, nothing else.\n\n${text}`,
      512
    );

    // Generate romaji if the result or source is Japanese
    let romaji: string | undefined;
    const japaneseText = sourceLang === "ja" ? text : translatedText;
    if (japaneseText) {
      const romajiResult = await callClaude(
        apiKey,
        `Convert the following Japanese text to romaji. Output only the romaji, nothing else.\n\n${japaneseText}`,
        256
      );
      if (romajiResult) romaji = romajiResult;
    }

    await ctx.runMutation(internal.messages.submitProcessedInternal, {
      messageId: args.messageId,
      processing: {
        translatedText: translatedText ?? undefined,
        romaji,
      },
    });
  },
});

export const getMessageByIdInternal = internalQuery({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.messageId);
  },
});

export const submitProcessedInternal = internalMutation({
  args: {
    messageId: v.id("messages"),
    processing: v.object({
      translatedText: v.optional(v.string()),
      romaji: v.optional(v.string()),
      suggestions: v.optional(v.array(v.string())),
      error: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await applyProcessedResult(ctx, args.messageId, args.processing);
  },
});

export const markMessageFailedInternal = internalMutation({
  args: {
    messageId: v.id("messages"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    await applyProcessingFailure(ctx, args.messageId, args.error);
  },
});
