import { api } from "@runwae/convex/convex/_generated/api";
import type { Doc, Id } from "@runwae/convex/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";

// ================================================================
// Types — mirrored from packages/convex/convex/schema.ts. Trip rows
// are now flat: no nested `trip_details`, no `group_members` array.
// Members are fetched separately via api.members.listByTrip.
// ================================================================

export type Trip = Doc<"trips">;

export type TripMember = {
  _id: Id<"trip_members">;
  role: "owner" | "editor" | "viewer";
  joinedAt: number;
  user: {
    _id: Id<"users">;
    name?: string;
    username?: string;
    avatarUrl?: string;
    image?: string;
  } | null;
};

// Convenience composite for screens that pair a trip with its accepted
// members. The members list is fetched in a sibling query and joined
// in the hook layer so consumers can stay declarative.
export type TripWithMembers = Trip & { members: TripMember[] };

// Legacy alias kept until consumers finish migrating off snake_case;
// new code should use `TripWithMembers` instead.
export type TripWithEverything = TripWithMembers;

export type TripVisibility = "private" | "invite_only" | "friends" | "public";
export type TripCategory =
  | "leisure" | "business" | "family" | "adventure" | "cultural" | "romantic";
export type TripMemberRole = "owner" | "editor" | "viewer";

export interface CreateTripInput {
  title: string;
  description?: string;
  destinationLabel?: string;
  destinationCoords?: { lat: number; lng: number };
  destinationId?: Id<"destinations">;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  category?: TripCategory;
  visibility: TripVisibility;
  currency: string;
  estimatedBudget?: number;
  coverImageUrl?: string;
}

export interface UpdateTripInput {
  title?: string;
  description?: string;
  coverImageUrl?: string;
  destinationLabel?: string;
  destinationCoords?: { lat: number; lng: number };
  startDate?: string;
  endDate?: string;
  visibility?: TripVisibility;
  category?: TripCategory;
  estimatedBudget?: number;
  currency?: string;
}

// ================================================================
// Reactive list hooks
// ================================================================

/** All trips the viewer is a member of (any status). Reactive. */
export function useMyTripsAll(): Trip[] | undefined {
  return useQuery(api.trips.getMyTrips, {});
}

/** Single trip by Convex id, with member-list access enforced server-side. */
export function useTripById(
  tripId: Id<"trips"> | string | undefined,
): Trip | null | undefined {
  return useQuery(
    api.trips.getTripById,
    tripId ? { tripId: tripId as Id<"trips"> } : "skip",
  );
}

/** Accepted members for a trip, with hydrated user records. Reactive. */
export function useTripMembers(
  tripId: Id<"trips"> | string | undefined,
): TripMember[] | undefined {
  return useQuery(
    api.members.listByTrip,
    tripId ? { tripId: tripId as Id<"trips"> } : "skip",
  ) as TripMember[] | undefined;
}

/** Viewer's membership row for a trip — surfaces pending invites. */
export function useViewerMembership(
  tripId: Id<"trips"> | string | undefined,
) {
  return useQuery(
    api.trips.getViewerMembership,
    tripId ? { tripId: tripId as Id<"trips"> } : "skip",
  );
}

// ================================================================
// Mutation hooks — thin wrappers so consumers can stay declarative.
// All Convex mutations throw on failure; callers should wrap in
// try/catch and surface errors via Toast/Alert.
// ================================================================

export function useCreateTrip() {
  return useMutation(api.trips.createTrip);
}

export function useUpdateTrip() {
  return useMutation(api.trips.updateTrip);
}

export function useDeleteTrip() {
  return useMutation(api.trips.deleteTrip);
}

export function useInviteToTrip() {
  return useMutation(api.trips.inviteToTrip);
}

export function useRespondToInvite() {
  return useMutation(api.trips.respondToInvite);
}

export function useJoinByCode() {
  return useMutation(api.trips.joinByCode);
}

export function useCreateFromTemplate() {
  return useMutation(api.trips.createFromTemplate);
}

export function useCloneTrip() {
  return useMutation(api.trips.cloneTrip);
}

// ================================================================
// Helpers
// ================================================================

/** Splits a flat trip list into "my" (creator) and "joined" (other) buckets. */
export function partitionTrips(
  trips: Trip[] | undefined,
  viewerUserId: Id<"users"> | string | undefined,
): { myTrips: Trip[]; joinedTrips: Trip[] } {
  if (!trips || !viewerUserId) return { myTrips: [], joinedTrips: [] };
  const my: Trip[] = [];
  const joined: Trip[] = [];
  for (const t of trips) {
    if ((t.creatorId as unknown as string) === viewerUserId) my.push(t);
    else joined.push(t);
  }
  // Newest first by createdAt for parity with the previous fetch order.
  my.sort((a, b) => b.createdAt - a.createdAt);
  joined.sort((a, b) => b.createdAt - a.createdAt);
  return { myTrips: my, joinedTrips: joined };
}
