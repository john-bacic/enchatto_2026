# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Enchatto is a real-time multilingual conversation platform. A host creates a room on iOS; participants join via QR code in the browser. Messages are translated and enhanced in real time by the host device.

## Architecture

- **Monorepo** with npm workspaces: `apps/*` and `packages/*`
- **Web app** (`apps/web/`): Next.js 14 + React 18 participant client. Uses Convex React hooks (`useQuery`/`useMutation`) for real-time subscriptions.
- **iOS app** (`apps/ios/`): SwiftUI host app. Communicates with Convex via HTTP POST actions (polling, not subscriptions).
- **Convex backend**: Schema, queries, mutations, and HTTP actions live in `apps/web/convex/`, the only folder that is deployed. A backup copy exists at `apps/convex/convex/` — keep both in sync, and never deploy from it.
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

There are two Convex deployments, and the deployed web app talks to both:

- **Production `basic-ram-104`:** the web app on Vercel (`NEXT_PUBLIC_CONVEX_URL`) and Release (TestFlight / App Store) iOS builds (`AppConfig.swift`)
- **Dev `helpful-bulldog-420`:** local dev (`apps/web/.env.local`), Debug iOS builds, and rooms created by older iOS builds, which the web app reaches through `NEXT_PUBLIC_CONVEX_LEGACY_URL` (`?b=legacy`)
- **Deploy everything:** `./deploy.sh` from the monorepo root, on a committed tree. It type-checks, pushes Convex functions to dev (`npx convex dev --once`), then to production (`npx convex deploy`, which asks before it pushes), then runs `git push`, deploys the web app with `npx vercel --prod --force`, and checks that https://enchatto.vercel.app/api/version reports the new SHA. It needs a terminal for the production prompt, so an agent asks the user to run it rather than running it
- **Order matters:** Convex functions go to both deployments before the web build that calls them. Open tabs reload onto a new web build within a minute (`DeployRefresh`), so a web build that is ahead of its functions breaks for everyone at once. Keep function changes backward compatible: installed iOS builds do not update with a deploy
- **Vercel:** project `web`, Root Directory `apps/web`, so the CLI must run from the monorepo root. The production branch is `main`; a push to any other branch only creates a preview build. A push to `main` is a production web deploy of `main`'s tree, so only push `main` when it is the commit `deploy.sh` just shipped
- **Convex environment variables** (`ANTHROPIC_API_KEY`, `GROQ_API_KEY`, `APNS_KEY`, `APNS_KEY_ID`, `APNS_TEAM_ID`) are set per deployment. Add a new one to both, from `apps/web/`: `npx convex env set NAME value`, then again with `--prod`
- **Switches, also Convex environment variables, all off when unset:**
  - `AUTH_MODE`: unset or `log` writes an `auth:` warning to the Convex log for a call with a missing or wrong caller token and lets it through; `enforce` refuses it. Set `enforce` only once the log shows no `auth:` lines from current clients
  - `PURGE_CLOSED_ROOMS_AFTER_DAYS`: a number of at least 1 makes the daily `rooms.purgeClosedRooms` cron delete rooms closed for longer than that, with their messages, game rows and stored files. Unset, nothing is deleted. Take a snapshot export before first setting it on production
  - `WORD_RUSH_GENERATIONS_PER_HOUR_MAX`: optional ceiling on Word Rush card generations across all rooms
- **iOS:** Rebuild in Xcode after deploy to pick up new git SHA

## Data Flow

1. Participant sends message via web → Convex mutation inserts with `status: "pending"`
2. iOS host polls for pending messages via HTTP actions (1.5s interval)
3. Host processes locally: translation → romaji + suggestions (concurrent)
4. Host submits processed result via HTTP → Convex updates message to `status: "processed"`
5. Web subscribers see the update in real time via Convex `useQuery`

## Key Patterns

- **Web routing:** `/` (QR scanner + join code) → `/join/[joinCode]` (nickname/avatar/language) → `/room/[roomId]?pid=participantId&tk=1`. `tk=1` marks a link made for a browser that holds the participant's token; opened anywhere else, the room page sends the guest back to the join page
- **Convex React provider:** `lib/convex.tsx` wraps the app with `ConvexProvider`
- **i18n:** Simple `t(key, lang)` function in `lib/i18n.ts` with hardcoded English/Japanese translations
- **iOS ↔ Convex:** `ConvexHTTPClient` POSTs to HTTP action routes defined in `convex/http.ts`
- **Games:** Three game types (Lost in Translation, Emoji Match, Truth or Dare) with their own Convex modules and UI components
- **Caller tokens, no accounts:** room access is by join code. A client makes a random token when it joins (`participants.joinRoom {token}`) or creates a room (`rooms.createRoom {hostToken}`); the server keeps it in `participantSecrets` and never returns it. Every mutation that acts for a participant takes an optional `token` (`callerToken` on `participants.setHostPushToken`, where `token` is the APNs device token) and checks it with `requireCaller` / `requireMember` / `requireHost` in `participants.ts`; what a failed check does depends on `AUTH_MODE`. The one exception is Emojifyr (the `*Emojifyr*` functions in `games.ts` and the `/api/emojifyr/*` routes): no current build offers it, and it takes no token and makes no check in either mode, so that installed iOS builds keep working. In HTTP bodies the token is `callerToken` (`hostToken` on `/api/rooms/create`, which registers it) and the caller is `callerId`, never `token` (on `/api/rooms/push-token` that is the APNs device token). The web wraps mutations in `useAuthedMutation` (`lib/convex.tsx`); iOS adds both fields in `ConvexHTTPClient`. Participants from before tokens have none and are accepted in both modes. Queries are not gated
- **Limits:** `takeRateLimit` in `participants.ts` (table `rateLimits`) throttles sends, pictures, dictation and model calls. A refusal's message contains "rate limit", which `http.ts` answers with 503 so the iOS send queue retries

## Schema

Core tables: `rooms`, `participants`, `messages`, `reactions`. Game tables: `gameSessions`, `gameChains`, `gameSteps`, `emojifyrRounds`, `emojifyrGuesses`, `emojiMatchGames`, `truthOrDareGames`, `truthOrDareTurns`. Schema defined in `apps/web/convex/schema.ts`.
