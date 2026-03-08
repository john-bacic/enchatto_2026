# Enchatto — Convex Backend

## Tables

- **rooms** — conversation rooms created by hosts
- **participants** — users in a room (host + participants)
- **messages** — text, image, drawing, and system messages
- **reactions** — emoji reactions on messages

## Data flow

1. Host creates a room via `rooms.createRoom` → gets a `joinCode`
2. Participants join via `participants.joinRoom` using the room ID (resolved from join code)
3. Anyone sends messages via `messages.sendTextMessage` / `sendImageMessage` / `sendDrawingMessage`
4. Text messages start as `pending`
5. Host device polls `messages.getPendingMessagesForProcessor` and processes each message
6. Host submits results via `messages.submitProcessedMessage` (translation, romaji, suggestions)
7. All clients subscribe to `messages.getRoomMessages` for real-time updates
8. Reactions are added/removed via `reactions.addReaction` / `removeReaction`

## Key indexes

- `rooms.by_joinCode` — fast join code lookup
- `messages.by_roomId_status` — efficient pending message queries for the processor
- `messages.by_roomId_createdAt` — ordered message timeline
- `reactions.by_messageId` — reaction summaries per message
