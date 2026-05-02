/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as account_deletion from "../account_deletion.js";
import type * as admin_collections from "../admin/collections.js";
import type * as admin_destinations from "../admin/destinations.js";
import type * as admin_events from "../admin/events.js";
import type * as admin_itinerary_templates from "../admin/itinerary_templates.js";
import type * as admin_users from "../admin/users.js";
import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as bookings from "../bookings.js";
import type * as commissions from "../commissions.js";
import type * as crons from "../crons.js";
import type * as currency from "../currency.js";
import type * as destinations from "../destinations.js";
import type * as discovery from "../discovery.js";
import type * as events from "../events.js";
import type * as expenses from "../expenses.js";
import type * as experiences from "../experiences.js";
import type * as flights from "../flights.js";
import type * as hotels from "../hotels.js";
import type * as http from "../http.js";
import type * as itinerary from "../itinerary.js";
import type * as lib_admin from "../lib/admin.js";
import type * as lib_coverImage from "../lib/coverImage.js";
import type * as lib_email from "../lib/email.js";
import type * as lib_event_sanitize from "../lib/event_sanitize.js";
import type * as lib_slug from "../lib/slug.js";
import type * as lib_user_sanitize from "../lib/user_sanitize.js";
import type * as lib_username from "../lib/username.js";
import type * as members from "../members.js";
import type * as migrations_backfill_admin_fields from "../migrations/backfill_admin_fields.js";
import type * as migrations_section7_verify from "../migrations/section7_verify.js";
import type * as migrations_seed_dev_events from "../migrations/seed_dev_events.js";
import type * as notifications from "../notifications.js";
import type * as payments from "../payments.js";
import type * as places from "../places.js";
import type * as polls from "../polls.js";
import type * as posts from "../posts.js";
import type * as providers_duffel from "../providers/duffel.js";
import type * as providers_geoapify from "../providers/geoapify.js";
import type * as providers_liteapi from "../providers/liteapi.js";
import type * as providers_rentalcars from "../providers/rentalcars.js";
import type * as providers_staticDiscovery from "../providers/staticDiscovery.js";
import type * as providers_ticketmaster from "../providers/ticketmaster.js";
import type * as providers_tiqets from "../providers/tiqets.js";
import type * as providers_types from "../providers/types.js";
import type * as providers_viator from "../providers/viator.js";
import type * as providers_yelp from "../providers/yelp.js";
import type * as routing from "../routing.js";
import type * as saved_items from "../saved_items.js";
import type * as search from "../search.js";
import type * as social from "../social.js";
import type * as stripeWebhook from "../stripeWebhook.js";
import type * as trips from "../trips.js";
import type * as unsplash from "../unsplash.js";
import type * as user_saves from "../user_saves.js";
import type * as users from "../users.js";
import type * as weather from "../weather.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  account_deletion: typeof account_deletion;
  "admin/collections": typeof admin_collections;
  "admin/destinations": typeof admin_destinations;
  "admin/events": typeof admin_events;
  "admin/itinerary_templates": typeof admin_itinerary_templates;
  "admin/users": typeof admin_users;
  ai: typeof ai;
  auth: typeof auth;
  bookings: typeof bookings;
  commissions: typeof commissions;
  crons: typeof crons;
  currency: typeof currency;
  destinations: typeof destinations;
  discovery: typeof discovery;
  events: typeof events;
  expenses: typeof expenses;
  experiences: typeof experiences;
  flights: typeof flights;
  hotels: typeof hotels;
  http: typeof http;
  itinerary: typeof itinerary;
  "lib/admin": typeof lib_admin;
  "lib/coverImage": typeof lib_coverImage;
  "lib/email": typeof lib_email;
  "lib/event_sanitize": typeof lib_event_sanitize;
  "lib/slug": typeof lib_slug;
  "lib/user_sanitize": typeof lib_user_sanitize;
  "lib/username": typeof lib_username;
  members: typeof members;
  "migrations/backfill_admin_fields": typeof migrations_backfill_admin_fields;
  "migrations/section7_verify": typeof migrations_section7_verify;
  "migrations/seed_dev_events": typeof migrations_seed_dev_events;
  notifications: typeof notifications;
  payments: typeof payments;
  places: typeof places;
  polls: typeof polls;
  posts: typeof posts;
  "providers/duffel": typeof providers_duffel;
  "providers/geoapify": typeof providers_geoapify;
  "providers/liteapi": typeof providers_liteapi;
  "providers/rentalcars": typeof providers_rentalcars;
  "providers/staticDiscovery": typeof providers_staticDiscovery;
  "providers/ticketmaster": typeof providers_ticketmaster;
  "providers/tiqets": typeof providers_tiqets;
  "providers/types": typeof providers_types;
  "providers/viator": typeof providers_viator;
  "providers/yelp": typeof providers_yelp;
  routing: typeof routing;
  saved_items: typeof saved_items;
  search: typeof search;
  social: typeof social;
  stripeWebhook: typeof stripeWebhook;
  trips: typeof trips;
  unsplash: typeof unsplash;
  user_saves: typeof user_saves;
  users: typeof users;
  weather: typeof weather;
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
