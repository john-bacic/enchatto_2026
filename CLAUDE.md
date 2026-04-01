# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Enchatto is a real-time multilingual conversation platform. A host creates a room on iOS; participants join via QR code in the browser. Messages are translated and enhanced in real time by the host device.

## Architecture

- **Monorepo** with npm workspaces: `apps/*` and `packages/*`
- **Web app** (`apps/web/`): Next.js 14 + React 18 participant client. Uses Convex React hooks (`useQuery`/`useMutation`) for real-time subscriptions.
- **iOS app** (`apps/ios/`): SwiftUI host app. Communicates with Convex via HTTP POST actions (polling, not subscriptions).
- **Convex backend**: Schema, queries, mutations, and HTTP actions live in `apps/web/convex/` (the active deployment). A backup copy exists at `apps/convex/convex/` — keep both in sync.
- **Shared types** (`packages/shared-types/`): TypeScript type contracts (Room, Participant, Message, Reaction) used by web and as reference for iOS.

## Commands

From monorepo root (`enchatto/`):

```bash
npm install                     # Install all workspace dependencies
npm run dev:web                 # Start Next.js dev server on :3000
npm run dev:convex              # Start Convex dev watcher
npm run build:web               # Production build of web app
npm run lint                    # Lint all workspaces
```

From `apps/web/`:

```bash
npx convex dev --once           # One-time deploy Convex functions to dev deployment
```

## Deployment

- **Convex dev deployment:** `helpful-bulldog-420` — this is what the web app uses via `NEXT_PUBLIC_CONVEX_URL` in `apps/web/.env.local`
- **Deploy Convex:** Run `npx convex dev --once` from `apps/web/` (NOT `npx convex deploy`, which targets prod)
- **Deploy web to Vercel:** Use `./deploy.sh` from monorepo root, which handles git push, Convex deploy, git SHA stamping, and Vercel deploy
- **iOS:** Rebuild in Xcode after deploy to pick up new git SHA

## Data Flow

1. Participant sends message via web → Convex mutation inserts with `status: "pending"`
2. iOS host polls for pending messages via HTTP actions (1.5s interval)
3. Host processes locally: translation → romaji + suggestions (concurrent)
4. Host submits processed result via HTTP → Convex updates message to `status: "processed"`
5. Web subscribers see the update in real time via Convex `useQuery`

## Key Patterns

- **Web routing:** `/` (QR scanner + join code) → `/join/[joinCode]` (nickname/avatar/language) → `/room/[roomId]?pid=participantId`
- **Convex React provider:** `lib/convex.tsx` wraps the app with `ConvexProvider`
- **i18n:** Simple `t(key, lang)` function in `lib/i18n.ts` with hardcoded English/Japanese translations
- **iOS ↔ Convex:** `ConvexHTTPClient` POSTs to HTTP action routes defined in `convex/http.ts`
- **Games:** Three game types (Lost in Translation, Emoji Match, Truth or Dare) with their own Convex modules and UI components
- **No authentication** in MVP — room access by join code only, participant identity by nickname + avatar

## Schema

Core tables: `rooms`, `participants`, `messages`, `reactions`. Game tables: `gameSessions`, `gameChains`, `gameSteps`, `emojifyrRounds`, `emojifyrGuesses`, `emojiMatchGames`, `truthOrDareGames`, `truthOrDareTurns`. Schema defined in `apps/web/convex/schema.ts`.
