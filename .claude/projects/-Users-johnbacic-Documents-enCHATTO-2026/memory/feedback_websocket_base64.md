---
name: WebSocket crashes from base64 data URLs in subscriptions
description: Large base64 data URLs in Convex subscription payloads crash the WebSocket. Both T/D turns and chat messages store data URLs that get broadcast.
type: feedback
---

Large base64 data URLs stored in Convex documents crash the WebSocket when subscription queries return them to all clients.

**Why:** Convex subscription payloads have a size limit. When drawings (base64 data URLs of 10-50KB+) accumulate in tables and queries return all records, the combined payload exceeds the WebSocket frame limit.

**How to apply:**
- T/D drawings: Fixed via HTTP POST → storage conversion in HTTP action → CDN URL stored
- T/D query: Strips `data:` URLs from `currentTurn`, excludes `responseMediaUrl` from `completedTurnsList`
- Chat messages (`getRoomMessages`): Still returns raw `mediaUrl` data URLs for drawings. This is a known issue that could cause WebSocket crashes as drawings accumulate. Future fix: convert chat drawings to file storage too, or paginate the messages query.
- Always prefer Convex file storage for binary data, never store base64 in documents that are part of subscription queries.
