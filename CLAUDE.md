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
npm run lint                    # ESLint over the web app, Convex functions and tests
npm run typecheck               # tsc over the web app, the Convex functions and the tests (.ts and .tsx)
npm test                        # Convex function tests (vitest + convex-test) and the web's component tests, about 5 seconds, no network
node scripts/check-localization.mjs   # Duplicate keys in apps/ios/Localization.swift crash the app at launch
```

From `apps/web/`:

```bash
npx convex dev --once           # One-time deploy Convex functions to dev deployment
npx vitest run tests/convex/messages.test.ts   # One test file
```

From `apps/ios/`:

```bash
swift test                      # Japanese text code (casualizer, romaji) as a Swift package, on macOS
```

## Testing

- **Convex tests** live in `apps/web/tests/convex/`, one file per area. They run the real schema and functions against an in-memory backend (`newBackend()` in `setup.ts`), including HTTP routes (`t.fetch`) and scheduled functions (fake timers). Node 22 is needed. `tests/no-network.ts` makes any real network call fail; a test that needs a model's answer stubs `fetch`
- **Web tests** live in `apps/web/tests/web/` and run in the same `npm test`: the readers in `lib/game-teams.ts`, the rule in `lib/game-results.ts` for which Emoji Match game the room page shows, the rule in `lib/textures.ts` for the background outside a room, the rules in `components/ui/logo.tsx` for how long each letter of the room header's wordmark waits before it hops and for which letter a tap is on, and the team screens of Lost in Translation and that wordmark rendered to static markup with `react-dom/server` (no DOM, so nothing is clicked and no effect runs). `textures.test.ts` also holds the texture list, the texture a room is drawn with, and the iPhone app's list and tiles (read as files from `apps/ios`) against each other. `vitest.config.mts` gives them the `@/` alias and JSX; `tests/tsconfig.json` type-checks them, a `.test.tsx` included, along with the components they render
- **Pins** hold what a move must not change. `tests/convex/http-routes.test.ts`: the whole list of HTTP routes (method and path) against `convex/http.ts`; a route added, renamed or removed on purpose changes its line there in the same change. `tests/convex/poll-cost.test.ts`: ceilings on what one poll by the iOS host returns and on what its costly queries read; a change that makes a poll cheaper lowers the ceilings it earned in the same commit. `tests/web/room-page.test.tsx`: the whole guest room page rendered to static markup in each state a first render can show, with `convex/react` and `next/navigation` mocked, and for each state a snapshot of its markup, the queries it subscribed to with their arguments and the mutations it asked for. It also draws by themselves the view components a first render does not reach (`components/room`: the settings sheet, the leave dialog, the join cut-in, the Resume buttons and others), holds the order of the layers that share a z-index, and calls the End Game button's rule (`lib/end-game.ts`). When a change to the page is meant, rewrite the snapshot with `npx vitest run tests/web/room-page.test.tsx -u` from `apps/web` and read its diff. No effect runs there, so handlers, effects and anything behind a tap are not covered
- **Checks for a move** live in `scripts/step6/`, each run with `node` from the repo root and described in its header: `list-routes.mjs` (the HTTP routes the Convex router registers), `line-account.mjs` (every line of a split file accounted for once, apart from an allow-list), `web-move-check.mjs` (a range table: each moved block unbroken and in order, the lines that stay in order) and `hook-order.mjs` (a component's hooks in the order they run, custom hooks opened, compared with a base commit). `scripts/step6/ios/` holds the Python tools that write the files of the iPhone room screen and of its view model from the one file each is at `1b68a6f`, with verifiers; its README gives the procedure. A file edited after the tools wrote it no longer equals their output, and `tree_state.py` then names the state `unknown`. `node scripts/step6/selftest/run-all.mjs` and `python3 scripts/step6/ios/selftest/run.py <new empty folder>` check the tools themselves
- **A test marked `test.fails` with a `DEFECT:` comment** states the correct behaviour for a known bug and passes only while the bug exists. Fixing the bug makes it report "Expect test to fail": remove `.fails` in the same change. `grep -rn "DEFECT:" apps/web/tests apps/ios/Tests` lists every known bug
- **What the in-memory backend does not model:** stored files have no content type (tests set it by hand), there is no concurrency or write conflict, and crons do not run (tests call the cron functions directly)
- **iOS text tests** live in `apps/ios/Tests/`. `apps/ios/Package.swift` compiles a few Foundation-only files from `Services/Processing` in place; it is not how the app is built. A known bug there is an `XCTExpectDefect` line
- **CI** (`.github/workflows/`): `ci.yml` runs type-check, lint, tests, the Convex backup-copy check, the localization check and the web build on every push to `main` or `redesign` and on pull requests; `ios-text.yml` runs `swift test` when the text code changes. `deploy.sh` deploys from the local tree before it pushes, so CI does not gate a deploy; the script runs `npm test` itself before it pushes anything
- **Adding a Swift file under `apps/ios`:** the file is listed in `Enchatto.xcodeproj/project.pbxproj` by inserting the lines XcodeGen would write for it, with `scripts/step6/ios/conversation-view/pbx_add.py` (its header gives the steps). The project is not regenerated: it holds edits a regeneration would undo. `scripts/step6/ios/pbx_insert_only.py` shows that nothing but insertions changed, and the build shows that the file is compiled. XcodeGen reads `apps/ios/project.yml`, which takes every file under `apps/ios` as app source unless `excludes` names it

## Deployment

There are two Convex deployments, and the deployed web app talks to both:

- **Production `basic-ram-104`:** the web app on Vercel (`NEXT_PUBLIC_CONVEX_URL`) and Release (TestFlight / App Store) iOS builds (`AppConfig.swift`)
- **Dev `helpful-bulldog-420`:** local dev (`apps/web/.env.local`), Debug iOS builds, and rooms created by older iOS builds, which the web app reaches through `NEXT_PUBLIC_CONVEX_LEGACY_URL` (`?b=legacy`)
- **Deploy everything:** `./deploy.sh` from the monorepo root, on a committed tree. It type-checks, runs the tests (`npm test`), pushes Convex functions to dev (`npx convex dev --once`), then to production (`npx convex deploy`, which asks before it pushes), then runs `git push`, deploys the web app with `npx vercel --prod --force`, and checks that https://enchatto.vercel.app/api/version reports the new SHA. It needs a terminal for the production prompt, so an agent asks the user to run it rather than running it
- **Order matters:** Convex functions go to both deployments before the web build that calls them. Open tabs reload onto a new web build within a minute (`DeployRefresh`), so a web build that is ahead of its functions breaks for everyone at once. The web's room page passes `token` to `games.getMyActiveStep`, and a server that does not declare that argument refuses the query, which takes the room page down: one more reason functions go first. Keep function changes backward compatible: installed iOS builds do not update with a deploy
- **Vercel:** project `web`, Root Directory `apps/web`, so the CLI must run from the monorepo root. The production branch is `main`; a push to any other branch only creates a preview build. A push to `main` is a production web deploy of `main`'s tree, so only push `main` when it is the commit `deploy.sh` just shipped
- **Convex environment variables** (`ANTHROPIC_API_KEY`, `GROQ_API_KEY`, `APNS_KEY`, `APNS_KEY_ID`, `APNS_TEAM_ID`) are set per deployment. Add a new one to both, from `apps/web/`: `npx convex env set NAME value`, then again with `--prod`
- **Switches, also Convex environment variables, all off when unset:**
  - `AUTH_MODE`: unset or `log` writes an `auth:` warning to the Convex log for a call with a missing or wrong caller token and lets it through; `enforce` refuses it. Set `enforce` only once the log shows no `auth:` lines from current clients
  - `PURGE_CLOSED_ROOMS_AFTER_DAYS`: a number of at least 1 makes the daily `rooms.purgeClosedRooms` cron delete rooms closed for longer than that, with their messages, game rows and stored files. Unset, nothing is deleted. Take a snapshot export before first setting it on production
  - `EMOJI_MATCH_HIDE_CARDS`: `on` makes the Emoji Match queries send face-down cards without their emoji and pair, so the board cannot be read ahead. Unset, the stored board is sent. Set it once iOS builds up to 2a14426 are no longer in use: they turn the host's tapped card over before the server answers and would draw an empty face
  - `LOST_IN_TRANSLATION_HIDE_ANSWER`: `on` makes `games.getMyActiveStep` send a Lost in Translation step only to its own player, and never say which option is right; the answer comes in the reply to the guess. Unset, a step goes to anyone who asks for it, with `correctOption`. The reply to a guess (`games.submitGameStep`, `/api/games/submit-step`) carries the result in both modes, to a caller with the player's token, whatever `AUTH_MODE` says. A player with no token on record is answered once, when the guess is taken; a guess that `AUTH_MODE` lets through without the player's token is taken and answered with nothing (`{"ok":true}` on the route). Set it once iOS builds up to e2c060f are no longer in use (they read `correctOption` off the step and stamp every pick "Wrong!", though the guess is scored correctly) and the web build that reads the reply has been live for a few minutes. Set it on production only, and not on the dev deployment while older Release builds still create rooms there
  - `WORD_RUSH_GENERATIONS_PER_HOUR_MAX`: optional ceiling on Word Rush card generations across all rooms
- **iOS:** Rebuild in Xcode after deploy to pick up new git SHA. The "Inject Git Commit SHA" build phase (in `apps/ios/project.yml` and in `project.pbxproj`) writes the first seven characters of `HEAD` into the built app's Info.plist as `GitCommitSHA` on every build, and `GitInfo.commitSHA` reads it for the label on the start screen and in the room's settings. The phase names the built Info.plist as its input file, which is what makes Xcode run it after writing that file; without it a rebuild writes the Info.plist over the stamp

## Data Flow

1. Participant sends message via web → Convex mutation inserts with `status: "pending"`
2. iOS host polls for pending messages via HTTP actions (1.5s interval)
3. Host processes locally: translation → romaji + suggestions (concurrent)
4. Host submits processed result via HTTP → Convex updates message to `status: "processed"`
5. Web subscribers see the update in real time via Convex `useQuery`

Two translators race on every text message, and whichever finishes first is what people see:

- **The backend** (`messages.translateMessageServerSide`, scheduled by each send) calls Claude Haiku for the translation and for the romaji. Its romaji instruction spells out the iOS app's conventions (particles as spoken, no macrons, lowercase), so a message reads the same whichever side wrote it
- **The host's phone** translates what `/api/messages/pending` hands it, then casualizes Japanese (`MeCabCasualizer`) and writes romaji (`MeCabRomajiService`). The casualizer only shows when the phone wins the race
- A result never replaces an existing translation. If the backend's own attempt fails (no key, an API error), the message waits `HOST_TURN_MS` for a host who is present; after that it is marked failed with `awaitingHost`, stays in the host's queue, and the host's translation replaces the failure whenever it arrives

## Key Patterns

- **Web routing:** `/` (QR scanner + join code) → `/join/[joinCode]` (nickname/avatar/language) → `/room/[roomId]?pid=participantId&tk=1`. `tk=1` marks a link made for a browser that holds the participant's token; opened anywhere else, the room page sends the guest back to the join page
- **Convex React provider:** `lib/convex.tsx` wraps the app with `ConvexProvider`
- **i18n:** Simple `t(key, lang)` function in `lib/i18n.ts` with hardcoded English/Japanese translations
- **iOS ↔ Convex:** `ConvexHTTPClient` POSTs to HTTP action routes. `convex/http.ts` holds the router and nothing else: each area registers its own routes from its own file (`httpRooms.ts`, `httpMessages.ts`, one `http<Game>.ts` per game), and the helpers they share are in `httpShared.ts`. `/api/rooms/snapshot` (`httpRooms.ts`) answers in one request what the host's refresh still asks for in ten or eleven, all but the replay: each section is the result of the query its own route runs (null where that route says `{"ok":true}`), and a section whose query was refused is left out and named in `errors`. A refusal of the room, its participants or its messages fails the request with 400 instead, as on their own routes, and a failure `jsonAction` answers 503 for (`isTransient` in `httpShared.ts`: a write conflict, an overloaded backend, a refused rate limit) fails the whole request with 503 in whichever section. No build calls it yet
- **iOS room screen:** `apps/ios/Views/HostConversationView.swift` holds the struct's state and `body`. Its other members are extensions in `Views/Conversation/` (`HostConversationView+Header`, `+MessageList`, `+Input`, `+Presentations`, `+Games`, `+Sheets`), beside the room's smaller views (the typing bubble, the vibe meter, the QR panel and others). `inputView` (`+Presentations`) puts the handlers, sheets and covers on the input bar through four helpers, applied in the order of its lines. The view model is `ViewModels/HostRoomViewModel.swift`, the class with its state and `init`, and ten extensions: `HostRoomViewModel+Sync`, `+Messages`, `+MessagePipeline`, `+SendQueue`, `+Room`, and one per game. An extension cannot hold a stored property, so state is declared in the main file, and a member that another file names is not `private`
- **Games:** Three game types (Lost in Translation, Emoji Match, Truth or Dare) with their own Convex modules and UI components. From four players Lost in Translation can be played as two teams, which the server deals balanced by language (`games.dealTeams`, `/api/games/deal-teams`; it writes nothing); the host starts the game by passing `teams` to `games.startGame` (`"auto"`, or the split it was shown, kept where it still fits whoever is dealt in). Each round's result for the teams is stored on the round's chain when the round ends, and the points clients are sent are read from there, so they never move while a round is open. A start without `teams` is an individual game, which is what installed builds send
- **Caller tokens, no accounts:** room access is by join code. A client makes a random token when it joins (`participants.joinRoom {token}`) or creates a room (`rooms.createRoom {hostToken}`); the server keeps it in `participantSecrets` and never returns it. Every mutation that acts for a participant takes an optional `token` (`callerToken` on `participants.setHostPushToken`, where `token` is the APNs device token) and checks it with `requireCaller` / `requireMember` / `requireHost` in `participants.ts`; what a failed check does depends on `AUTH_MODE`. The one exception is Emojifyr (the `*Emojifyr*` functions in `games.ts` and the `/api/emojifyr/*` routes): no current build offers it, and it takes no token and makes no check in either mode, so that installed iOS builds keep working. In HTTP bodies the token is `callerToken` (`hostToken` on `/api/rooms/create`, which registers it) and the caller is `callerId`, never `token` (on `/api/rooms/push-token` that is the APNs device token). The web wraps mutations in `useAuthedMutation` (`lib/convex.tsx`); iOS adds both fields in `ConvexHTTPClient`. Participants from before tokens have none and are accepted in both modes. Queries are not gated, except that with `LOST_IN_TRANSLATION_HIDE_ANSWER` on `games.getMyActiveStep` answers only a caller who proves to be that participant (`token` in its arguments, `callerToken` on the route; a participant with no token on record has nothing to prove)
- **Backgrounds:** a room has one of 36 textures, `rooms.background`, an index into `TEXTURES` (`apps/web/lib/textures.ts`) and `RoomTexture.all` (iOS), which list them in the same order. The host app names it when it creates the room (`background` on `rooms.createRoom` and `/api/rooms/create`): the one on its start screen, so the room looks like the screen it is entered from. Without a valid one the server picks at random among the first ten. The start screen shows the texture of the room there is to rejoin, and a random one when there is none; a web screen outside a room shows the texture of the last room the tab showed (`sessionStorage`), and a random one when there is none. While a room is open its host can give it another texture (`rooms.setRoomBackground`, `/api/rooms/background`; host only, and an index that is not a texture is refused), and guests' pages follow by themselves, because they draw the index stored on the room. On iPhone a full-screen cover shown from a room (the game task cover, the replay, the drawing composer) draws the room's texture too: the room screen puts its index in the `roomTextureIndex` environment value, which `ecPaperBackground()` reads, and each sheet or cover is handed it where it is presented
  - **The first ten are the ones every build has**, and two rules stay among them however long the list grows. The server's own pick (`PICKED_BACKGROUND_COUNT` in `rooms.ts`): the app that sends no background is an iPhone build from before the start screen named one, and it ships the tiles of those ten only. And the fallback for a room with no stored index, the FNV-1a hash of its join code modulo ten (`textureForRoom` on the web, `RoomTexture.index` on iOS): every build then draws such a room alike, and a room from before the index was stored keeps its texture. A build handed an index it does not know (an older app in a room whose host picked a newer texture) takes the same fallback
  - **Adding a texture** takes four things, all in the same order: an entry at the end of `TEXTURES`, the same key and blob pair at the end of `RoomTexture.all`, its tile as a PNG at three times the svg's size in `apps/ios/Assets.xcassets/Textures/tex-<key>.imageset`, and `BACKGROUND_COUNT` in `convex/rooms.ts` (both copies). Never move or remove one: rooms store the index. `tests/web/textures.test.ts` holds the two lists and the tiles against each other
- **Limits:** `takeRateLimit` in `participants.ts` (table `rateLimits`) throttles sends, pictures, dictation and model calls. A refusal's message contains "rate limit", which the routes answer with 503 (`jsonAction` in `httpShared.ts`, and the drawing route's own mapper in `httpMessages.ts`) so the iOS send queue retries

## Schema

Core tables: `rooms`, `participants`, `messages`, `reactions`. Game tables: `gameSessions`, `gameChains`, `gameSteps`, `emojifyrRounds`, `emojifyrGuesses`, `emojiMatchGames`, `truthOrDareGames`, `truthOrDareTurns`. Schema defined in `apps/web/convex/schema.ts`. A team game of Lost in Translation is a session with `gameSessions.teams` (and `teamAway`), and keeps each round's result in `gameChains.teamRound`; an individual game has none of the three.
