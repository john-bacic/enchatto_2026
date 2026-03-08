# Enchatto

Real-time multilingual conversation rooms.

## Overview

Enchatto lets a host create a conversation room on their iPhone. Participants join via QR code in any browser. Messages are translated and enhanced in real time by the host device.

## Architecture

- **Host app:** Native iOS (SwiftUI)
- **Participant app:** Web (Next.js + React + TypeScript)
- **Backend / state sync:** Convex
- **On-device processing:** Host iPhone handles translation, romaji, and suggestions

## Project structure

```
enchatto/
  apps/
    web/          # Next.js participant web app
    ios/          # SwiftUI host app
    convex/       # Convex backend (schema, queries, mutations, HTTP actions)
  packages/
    shared-types/ # Shared TypeScript type definitions
```

## Flow

1. Host creates a room in the iOS app (nickname, avatar, language settings)
2. Host displays a QR code with a join link
3. Participants scan QR and join in the browser (choose nickname, avatar, language)
4. Participants send text, images, or drawings
5. Text messages appear as "pending" until the host device processes them
6. Host iPhone translates, generates romaji, and creates suggestions
7. Processed messages are pushed to everyone in real time
8. Messages support emoji reactions and threaded replies

## Setup

### Prerequisites

- Node.js 18+
- npm
- Xcode 15+ (for iOS app)
- A Convex account

### Install dependencies

```bash
npm install
```

### Convex backend

```bash
cd apps/convex
npx convex dev
```

This starts the Convex development server and deploys your schema and functions.

### Web app

```bash
cd apps/web
npm run dev
```

Set `NEXT_PUBLIC_CONVEX_URL` in `apps/web/.env.local` to your Convex deployment URL.

### iOS app

Open `apps/ios/` in Xcode. Update the Convex deployment URL in `Services/API/AppConfig.swift`.

To use the mock backend (no Convex required), set `useMock = true` in `AppConfig.swift`.

## Key features

- **16 preset avatars** with colored backgrounds, consistent across web and iOS
- **Rich media:** text, images (photo library + camera), and freehand drawings
- **Processing pipeline:** translation → romaji + suggestions (concurrent)
- **Reactions:** 6 emoji reactions per message
- **Replies:** threaded reply-to with preview
- **Room management:** host can close room, kick participants
- **QR code + share sheet** for easy room joining

## Tech details

| Layer | Technology |
|-------|-----------|
| iOS UI | SwiftUI |
| Web UI | Next.js 14 + React 18 |
| Backend | Convex (schema, mutations, queries) |
| iOS ↔ Backend | HTTP actions (`http.ts`) with JSON POST |
| Web ↔ Backend | Convex React hooks (real-time subscriptions) |
| State sync (iOS) | Polling (2s room state, 1.5s processing) |
| State sync (Web) | Real-time via Convex `useQuery` |
| QR generation | CoreImage `CIFilter.qrCodeGenerator` |
| Drawing | HTML Canvas (web) / UIKit (iOS) |

## TODOs for production

- Replace base64 data URLs with Convex file storage for images/drawings
- Integrate real translation service (Apple Translation framework or API)
- Add authentication / session management
- Rate limiting on message sends
- Persistent participant sessions (reconnect after refresh)
