import { ActionCtx, httpAction } from "./_generated/server";
import { DRAWING_MAX_BYTES } from "./participants";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Helper: parse JSON body and call a mutation/query. ctx is typed so the compiler checks the
// argument names each route passes: Convex refuses a call that carries an argument its function does not declare
export function jsonAction(handler: (ctx: ActionCtx, body: any) => Promise<any>) {
  return httpAction(async (ctx, request) => {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    try {
      const body = await request.json();
      const result = await handler(ctx, body);
      return new Response(JSON.stringify(result ?? { ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e: any) {
      const message = e?.message ?? String(e);
      // Convex OCC / transient errors surface as system errors — return 503
      // so the iOS client can distinguish retryable from permanent failures.
      const isTransient = message.includes("OCC") || message.includes("overloaded") || message.includes("rate limit");
      return new Response(JSON.stringify({ error: message }), {
        status: isTransient ? 503 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  });
}

// Base64 inside JSON is a third larger than the image; the rest of the body is a few ids
const DRAWING_BODY_MAX_BYTES = Math.ceil(DRAWING_MAX_BYTES / 3) * 4 + 16 * 1024;

/** Refuses an oversized drawing on its declared length, before the body is read into memory */
export function checkDrawingBodySize(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > DRAWING_BODY_MAX_BYTES) {
    throw new Error("Drawing too large (max 8 MB)");
  }
}

/**
 * The image inside a drawing's data URL. Type and size are checked here, before anything is stored: iOS
 * sends PNG, the web canvas JPEG, and nothing else is a drawing. A link is refused: stored as a drawing,
 * every viewer's device would fetch it.
 */
export function decodeDrawing(dataUrl: unknown): Blob {
  if (typeof dataUrl !== "string") throw new Error("Drawing is missing");
  const comma = dataUrl.indexOf(",");
  const header = dataUrl.slice(0, Math.max(comma, 0));
  if (header !== "data:image/png;base64" && header !== "data:image/jpeg;base64") {
    throw new Error("Drawing must be a PNG or JPEG image");
  }
  const base64 = dataUrl.slice(comma + 1);
  if (base64.length > Math.ceil(DRAWING_MAX_BYTES / 3) * 4) throw new Error("Drawing too large (max 8 MB)");
  let binary: string;
  try {
    binary = atob(base64);
  } catch {
    throw new Error("Drawing is not valid base64");
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  // "data:image/png;base64" without its first five and last seven characters is the type
  return new Blob([bytes], { type: header.slice(5, -7) });
}

// In every body the caller's token is `callerToken` and the caller's participant id is `callerId`
// (participants.ts: requireCaller). Never `token`: /api/rooms/push-token already carries the APNs device
// token under that name. Bodies from builds before tokens have neither field, and both are optional.
