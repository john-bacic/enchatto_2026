"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { OutgoingVoiceClip } from "@/components/message-input";
import { tokenFor, useAuthedMutation } from "@/lib/convex";
import { t } from "@/lib/i18n";
import { QUEUED_ID_PREFIX } from "@/lib/types";

interface QueuedMessage {
  id: string;
  kind: "text" | "image" | "drawing";
  text?: string;
  mediaUrl?: string;
  replyToId?: string;
  createdAt: number;
}

export function useOutbox({
  roomId,
  participantId,
  isOnline,
  replyTo,
  setReplyTo,
  lang,
  convexSiteUrl,
}: {
  roomId: string;
  participantId: string;
  isOnline: boolean;
  replyTo: string | null;
  setReplyTo: Dispatch<SetStateAction<string | null>>;
  lang: string;
  convexSiteUrl: string;
}) {
  const [offlineQueue, setOfflineQueue] = useState<QueuedMessage[]>([]);
  const isFlushingRef = useRef(false);

  const sendTextMessage = useAuthedMutation(api.messages.sendTextMessage);
  const generateUploadUrl = useAuthedMutation(api.messages.generateUploadUrl);
  const sendImageMessage = useAuthedMutation(api.messages.sendImageMessage);
  const sendAudioMessage = useAuthedMutation(api.messages.sendAudioMessage);
  const sendDrawingMessage = useAuthedMutation(api.messages.sendDrawingMessage);

  const enqueueMessage = useCallback(
    (msg: Omit<QueuedMessage, "id" | "createdAt">) => {
      const queued: QueuedMessage = {
        ...msg,
        id: `${QUEUED_ID_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
      };
      setOfflineQueue((q) => [...q, queued]);
      return queued;
    },
    []
  );

  const handleSend = useCallback(
    async (text: string) => {
      if (!participantId) return;
      if (!isOnline) {
        enqueueMessage({ kind: "text", text, replyToId: replyTo ?? undefined });
        setReplyTo(null);
        return;
      }
      try {
        await sendTextMessage({
          roomId: roomId as Id<"rooms">,
          senderId: participantId as Id<"participants">,
          text,
          replyToId: replyTo
            ? (replyTo as Id<"messages">)
            : undefined,
        });
        setReplyTo(null);
      } catch (err) {
        console.error("Failed to send message, queuing:", err);
        enqueueMessage({ kind: "text", text, replyToId: replyTo ?? undefined });
        setReplyTo(null);
      }
    },
    [sendTextMessage, roomId, participantId, replyTo, isOnline, enqueueMessage]
  );

  const handleSendImage = useCallback(
    async (file: File) => {
      if (!participantId) return;
      // The server refuses these as well, and deletes the upload. Saying so here saves the upload.
      // A file the browser cannot name has no type and is let through, as the server lets it through. A declared
      // application/octet-stream is refused here on purpose (it is what a browser calls a .bin or .exe); the
      // server takes it only for builds that queued an untyped file that way
      if ((file.type && !file.type.startsWith("image/")) || file.size > 50 * 1024 * 1024) {
        alert(t("That picture can't be sent (images up to 50 MB)", lang));
        return;
      }
      if (!isOnline) {
        // Convert to base64 data URL for offline queue
        const reader = new FileReader();
        reader.onloadend = () => {
          enqueueMessage({ kind: "image", mediaUrl: reader.result as string, replyToId: replyTo ?? undefined });
          setReplyTo(null);
        };
        reader.readAsDataURL(file);
        return;
      }
      try {
        // Upload to Convex file storage
        const uploadUrl = await generateUploadUrl({ callerId: participantId as Id<"participants"> });
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        const { storageId } = await result.json();

        await sendImageMessage({
          roomId: roomId as Id<"rooms">,
          senderId: participantId as Id<"participants">,
          storageId,
          replyToId: replyTo ? (replyTo as Id<"messages">) : undefined,
        });
        setReplyTo(null);
      } catch (err) {
        console.error("Failed to send image, queuing:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          enqueueMessage({ kind: "image", mediaUrl: reader.result as string, replyToId: replyTo ?? undefined });
          setReplyTo(null);
        };
        reader.readAsDataURL(file);
      }
    },
    [generateUploadUrl, sendImageMessage, roomId, participantId, replyTo, isOnline, enqueueMessage, lang]
  );

  const handleSendVoice = useCallback(
    async (clip: OutgoingVoiceClip) => {
      if (!participantId) return;
      const replyToId = replyTo ? (replyTo as Id<"messages">) : undefined;
      setReplyTo(null);
      try {
        if (!isOnline) throw new Error("offline");
        const uploadUrl = await generateUploadUrl({ callerId: participantId as Id<"participants"> });
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": clip.blob.type || "audio/mp4" },
          body: clip.blob,
        });
        if (!result.ok) throw new Error(`Upload failed (${result.status})`);
        const { storageId } = await result.json();
        await sendAudioMessage({
          roomId: roomId as Id<"rooms">,
          senderId: participantId as Id<"participants">,
          storageId,
          durationMs: clip.durationMs,
          waveform: clip.waveform,
          text: clip.text,
          lang: clip.lang,
          replyToId,
        });
      } catch (err) {
        // Audio can't sit in the offline queue, but the words can
        console.error("Failed to send voice message:", err);
        if (clip.text) enqueueMessage({ kind: "text", text: clip.text, replyToId });
      }
    },
    [generateUploadUrl, sendAudioMessage, roomId, participantId, replyTo, isOnline, enqueueMessage]
  );

  const handleSendDrawing = useCallback(
    async (dataUrl: string) => {
      if (!participantId) return;
      if (!isOnline) {
        enqueueMessage({ kind: "drawing", mediaUrl: dataUrl, replyToId: replyTo ?? undefined });
        setReplyTo(null);
        return;
      }
      try {
        // Use HTTP POST to convert base64 to file storage server-side.
        // This keeps the messages subscription payload small (CDN URLs only).
        const res = await fetch(`${convexSiteUrl}/api/messages/send-drawing`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId,
            senderId: participantId,
            // In a route's body the caller's token is callerToken: `token` there can be something else
            callerToken: tokenFor(participantId),
            mediaUrl: dataUrl,
            replyToId: replyTo ?? undefined,
          }),
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        setReplyTo(null);
      } catch (err) {
        console.error("Failed to send drawing, queuing:", err);
        enqueueMessage({ kind: "drawing", mediaUrl: dataUrl, replyToId: replyTo ?? undefined });
        setReplyTo(null);
      }
    },
    [sendDrawingMessage, roomId, participantId, replyTo, isOnline, enqueueMessage, convexSiteUrl]
  );

  // Flush offline queue when back online
  const flushQueue = useCallback(async () => {
    if (isFlushingRef.current || offlineQueue.length === 0) return;
    isFlushingRef.current = true;
    const remaining = [...offlineQueue];
    for (let i = 0; i < remaining.length; i++) {
      const item = remaining[i];
      try {
        if (item.kind === "text" && item.text) {
          await sendTextMessage({
            roomId: roomId as Id<"rooms">,
            senderId: participantId as Id<"participants">,
            text: item.text,
            replyToId: item.replyToId ? (item.replyToId as Id<"messages">) : undefined,
          });
        } else if (item.kind === "image" && item.mediaUrl) {
          // Convert data URL back to blob for upload
          const res = await fetch(item.mediaUrl);
          const blob = await res.blob();
          const uploadUrl = await generateUploadUrl({ callerId: participantId as Id<"participants"> });
          const uploadResult = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": blob.type || "image/png" },
            body: blob,
          });
          const { storageId } = await uploadResult.json();
          await sendImageMessage({
            roomId: roomId as Id<"rooms">,
            senderId: participantId as Id<"participants">,
            storageId,
            replyToId: item.replyToId ? (item.replyToId as Id<"messages">) : undefined,
          });
        } else if (item.kind === "drawing" && item.mediaUrl) {
          await sendDrawingMessage({
            roomId: roomId as Id<"rooms">,
            senderId: participantId as Id<"participants">,
            mediaUrl: item.mediaUrl,
            replyToId: item.replyToId ? (item.replyToId as Id<"messages">) : undefined,
          });
        }
        // Remove successfully sent item
        setOfflineQueue((q) => q.filter((m) => m.id !== item.id));
      } catch (err) {
        console.error("Flush failed at item, stopping:", item.id, err);
        break; // Stop on first failure, retry next time
      }
    }
    isFlushingRef.current = false;
  }, [offlineQueue, roomId, participantId, sendTextMessage, generateUploadUrl, sendImageMessage, sendDrawingMessage]);

  // Auto-flush when transitioning offline→online
  const wasOnlineRef = useRef(isOnline);
  useEffect(() => {
    if (isOnline && !wasOnlineRef.current) {
      flushQueue();
    }
    wasOnlineRef.current = isOnline;
  }, [isOnline, flushQueue]);

  // Merge queued messages into the display list
  const queuedAsMessages = offlineQueue.map((q) => ({
    _id: q.id,
    senderId: participantId,
    kind: q.kind,
    status: "pending" as const,
    text: q.text,
    mediaUrl: q.mediaUrl,
    replyToId: q.replyToId,
    createdAt: q.createdAt,
  }));

  return { offlineQueue, queuedAsMessages, handleSend, handleSendImage, handleSendVoice, handleSendDrawing };
}
