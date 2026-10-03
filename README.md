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
      convex/     # Convex backend (schema, queries, mutations, HTTP actions): the deployed copy
    ios/          # SwiftUI host app
    convex/       # Backup copy of the Convex backend; never deployed
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
cd apps/web
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

Open `apps/ios/` in Xcode. `Services/API/AppConfig.swift` picks the Convex deployment: dev for Debug builds, production for Release builds.

To use the mock backend (no Convex required), set `useMockAPI = true` in `AppConfig.swift`.

## Deployments

There are two Convex deployments, and the deployed web app talks to both:

- **Production (`basic-ram-104`):** the web app on Vercel and Release (TestFlight / App Store) iOS builds.
- **Dev (`helpful-bulldog-420`):** local development, Debug iOS builds, and rooms created by older iOS builds, which the web app reaches through `NEXT_PUBLIC_CONVEX_LEGACY_URL`.

Convex functions have to be live on both before the web build that calls them, because open tabs reload onto a new web build within a minute. See the Deployment section of `CLAUDE.md` for the details.

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
