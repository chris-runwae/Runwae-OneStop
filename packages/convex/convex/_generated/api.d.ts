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
import type * as discovery from "../discovery.js";
import type * as events from "../events.js";
import type * as flights from "../flights.js";
import type * as hotels from "../hotels.js";
import type * as http from "../http.js";
import type * as itinerary from "../itinerary.js";
import type * as lib_coverImage from "../lib/coverImage.js";
import type * as lib_username from "../lib/username.js";
import type * as members from "../members.js";
import type * as notifications from "../notifications.js";
import type * as payments from "../payments.js";
import type * as polls from "../polls.js";
import type * as posts from "../posts.js";
import type * as providers_duffel from "../providers/duffel.js";
import type * as providers_liteapi from "../providers/liteapi.js";
import type * as providers_rentalcars from "../providers/rentalcars.js";
import type * as providers_staticDiscovery from "../providers/staticDiscovery.js";
import type * as providers_tiqets from "../providers/tiqets.js";
import type * as providers_types from "../providers/types.js";
import type * as providers_viator from "../providers/viator.js";
import type * as providers_yelp from "../providers/yelp.js";
import type * as saved_items from "../saved_items.js";
import type * as search from "../search.js";
import type * as social from "../social.js";
import type * as trips from "../trips.js";
import type * as user_saves from "../user_saves.js";
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
  discovery: typeof discovery;
  events: typeof events;
  flights: typeof flights;
  hotels: typeof hotels;
  http: typeof http;
  itinerary: typeof itinerary;
  "lib/coverImage": typeof lib_coverImage;
  "lib/username": typeof lib_username;
  members: typeof members;
  notifications: typeof notifications;
  payments: typeof payments;
  polls: typeof polls;
  posts: typeof posts;
  "providers/duffel": typeof providers_duffel;
  "providers/liteapi": typeof providers_liteapi;
  "providers/rentalcars": typeof providers_rentalcars;
  "providers/staticDiscovery": typeof providers_staticDiscovery;
  "providers/tiqets": typeof providers_tiqets;
  "providers/types": typeof providers_types;
  "providers/viator": typeof providers_viator;
  "providers/yelp": typeof providers_yelp;
  saved_items: typeof saved_items;
  search: typeof search;
  social: typeof social;
  trips: typeof trips;
  user_saves: typeof user_saves;
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
