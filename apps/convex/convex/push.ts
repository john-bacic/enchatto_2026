"use node";

import { connect } from "node:http2";
import { sign } from "node:crypto";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

const TOPIC = "com.enchatto.app";
const HOSTS = {
  production: "api.push.apple.com",
  sandbox: "api.sandbox.push.apple.com",
} as const;

// APNs throttles provider tokens refreshed more often than every 20 minutes; reuse while the runtime is warm
let cachedJwt: { value: string; issuedAt: number } | null = null;

function providerToken(keyId: string, teamId: string, p8: string) {
  const now = Math.floor(Date.now() / 1000);
  if (cachedJwt && now - cachedJwt.issuedAt < 45 * 60) return cachedJwt.value;
  const b64url = (data: string | Buffer) => Buffer.from(data).toString("base64url");
  const unsigned = `${b64url(JSON.stringify({ alg: "ES256", kid: keyId }))}.${b64url(JSON.stringify({ iss: teamId, iat: now }))}`;
  const signature = sign("sha256", Buffer.from(unsigned), { key: p8, dsaEncoding: "ieee-p1363" });
  cachedJwt = { value: `${unsigned}.${b64url(signature)}`, issuedAt: now };
  return cachedJwt.value;
}

/** APNS_KEY holds the .p8 file either as PEM or base64 of the whole file */
function readKey(raw: string) {
  const pem = raw.includes("BEGIN PRIVATE KEY") ? raw : Buffer.from(raw, "base64").toString("utf8");
  return pem.replace(/\\n/g, "\n");
}

function post(host: string, deviceToken: string, jwt: string, payload: unknown) {
  return new Promise<{ status: number; reason?: string }>((resolve, reject) => {
    const client = connect(`https://${host}`);
    client.on("error", reject);
    const req = client.request({
      ":method": "POST",
      ":path": `/3/device/${deviceToken}`,
      authorization: `bearer ${jwt}`,
      "apns-topic": TOPIC,
      "apns-push-type": "alert",
      "apns-priority": "10",
      "content-type": "application/json",
    });
    let status = 0;
    let body = "";
    req.setEncoding("utf8");
    req.on("response", (headers) => {
      status = Number(headers[":status"]);
    });
    req.on("data", (chunk: string) => {
      body += chunk;
    });
    req.on("end", () => {
      client.close();
      let reason: string | undefined;
      try {
        reason = body ? (JSON.parse(body) as { reason?: string }).reason : undefined;
      } catch {
        reason = body;
      }
      resolve({ status, reason });
    });
    req.on("error", (e) => {
      client.close();
      reject(e);
    });
    req.end(JSON.stringify(payload));
  });
}

export const sendToHost = internalAction({
  args: { roomId: v.id("rooms"), token: v.string(), title: v.string(), body: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const keyId = process.env.APNS_KEY_ID;
    const teamId = process.env.APNS_TEAM_ID;
    const rawKey = process.env.APNS_KEY;
    if (!keyId || !teamId || !rawKey) {
      console.warn("APNs env vars missing; skipping push");
      return null;
    }
    const jwt = providerToken(keyId, teamId, readKey(rawKey));
    const payload = {
      aps: { alert: { title: args.title, body: args.body }, sound: "default", "thread-id": args.roomId },
      roomId: args.roomId,
    };

    // Xcode-installed builds get sandbox tokens even in Release; App Store/TestFlight builds get production ones
    let result = await post(HOSTS.production, args.token, jwt, payload);
    if (result.status === 400 && result.reason === "BadDeviceToken") {
      result = await post(HOSTS.sandbox, args.token, jwt, payload);
    }
    if (result.status === 200) return null;

    console.error("APNs push failed", result);
    if (result.status === 410 || result.reason === "BadDeviceToken") {
      await ctx.runMutation(internal.participants.clearHostPushToken, { roomId: args.roomId, token: args.token });
    }
    return null;
  },
});
