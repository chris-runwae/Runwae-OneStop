/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as bookings from "../bookings.js";
import type * as commissions from "../commissions.js";
import type * as crons from "../crons.js";
import type * as currency from "../currency.js";
import type * as destinations from "../destinations.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as itinerary from "../itinerary.js";
import type * as members from "../members.js";
import type * as notifications from "../notifications.js";
import type * as posts from "../posts.js";
import type * as saved_items from "../saved_items.js";
import type * as search from "../search.js";
import type * as social from "../social.js";
import type * as trips from "../trips.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  auth: typeof auth;
  bookings: typeof bookings;
  commissions: typeof commissions;
  crons: typeof crons;
  currency: typeof currency;
  destinations: typeof destinations;
  events: typeof events;
  http: typeof http;
  itinerary: typeof itinerary;
  members: typeof members;
  notifications: typeof notifications;
  posts: typeof posts;
  saved_items: typeof saved_items;
  search: typeof search;
  social: typeof social;
  trips: typeof trips;
  users: typeof users;
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
