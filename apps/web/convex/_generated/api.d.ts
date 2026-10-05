/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as crons from "../crons.js";
import type * as emojiBingo from "../emojiBingo.js";
import type * as emojiMatch from "../emojiMatch.js";
import type * as gameShared from "../gameShared.js";
import type * as games from "../games.js";
import type * as http from "../http.js";
import type * as httpEmojiBingo from "../httpEmojiBingo.js";
import type * as httpEmojiMatch from "../httpEmojiMatch.js";
import type * as httpEmojifyr from "../httpEmojifyr.js";
import type * as httpGames from "../httpGames.js";
import type * as httpMessages from "../httpMessages.js";
import type * as httpRooms from "../httpRooms.js";
import type * as httpShared from "../httpShared.js";
import type * as httpTruthOrDare from "../httpTruthOrDare.js";
import type * as httpWordRush from "../httpWordRush.js";
import type * as messages from "../messages.js";
import type * as participants from "../participants.js";
import type * as push from "../push.js";
import type * as reactions from "../reactions.js";
import type * as rooms from "../rooms.js";
import type * as truthOrDare from "../truthOrDare.js";
import type * as wordRush from "../wordRush.js";
import type * as wordRushDeck from "../wordRushDeck.js";
import type * as wordRushShared from "../wordRushShared.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  emojiBingo: typeof emojiBingo;
  emojiMatch: typeof emojiMatch;
  gameShared: typeof gameShared;
  games: typeof games;
  http: typeof http;
  httpEmojiBingo: typeof httpEmojiBingo;
  httpEmojiMatch: typeof httpEmojiMatch;
  httpEmojifyr: typeof httpEmojifyr;
  httpGames: typeof httpGames;
  httpMessages: typeof httpMessages;
  httpRooms: typeof httpRooms;
  httpShared: typeof httpShared;
  httpTruthOrDare: typeof httpTruthOrDare;
  httpWordRush: typeof httpWordRush;
  messages: typeof messages;
  participants: typeof participants;
  push: typeof push;
  reactions: typeof reactions;
  rooms: typeof rooms;
  truthOrDare: typeof truthOrDare;
  wordRush: typeof wordRush;
  wordRushDeck: typeof wordRushDeck;
  wordRushShared: typeof wordRushShared;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
