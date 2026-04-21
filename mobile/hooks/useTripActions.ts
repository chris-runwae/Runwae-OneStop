/**
 * useTripActions.ts
 *
 * Pure async data functions for trip management. No hook wrapper,
 * no internal state — call directly from components or stores.
 *
 * NOTE: The actual Supabase client lives at @/utils/supabase/client.
 * This file imports from @/lib/supabase — ensure that path is aliased
 * or re-exported in tsconfig/babel config.
 *
 * SCHEMA NOTES — two sets of columns are typed below but not yet in the
 * DB. Add them via a follow-up migration before calling the functions
 * that write them:
 *
 *   ALTER TABLE public.trip_details
 *     ADD COLUMN IF NOT EXISTS start_date date,
 *     ADD COLUMN IF NOT EXISTS end_date   date;
 *
 *   ALTER TABLE public.groups
 *     ADD COLUMN IF NOT EXISTS destination_label    text,
 *     ADD COLUMN IF NOT EXISTS destination_place_id text,
 *     ADD COLUMN IF NOT EXISTS destination_address  text;
 */

import { supabase } from '@/utils/supabase/client';

// Enums / union types

export type GroupMemberRole = 'member' | 'admin' | 'owner';
export type TripVisibility = 'private' | 'invite_only' | 'public';

// Row types (match DB schema exactly)

export interface Trip {
  id: string;
  type: 'trip';
  name: string;
  description: string | null;
  created_by: string;
  group_id: string | null; // self-ref: parent trip-group
  // Pending columns (see SCHEMA NOTES above):
  destination_label: string | null;
  destination_place_id: string | null;
  destination_address: string | null;
  created_at: string;
  updated_at: string;
  cover_image_url: string | null;
  join_code: string | null;
}

export interface TripDetails {
  id: string;
  group_id: string;
  budget: number | null;
  currency: string;
  notes: string | null;
  cover_image_url: string | null;
  visibility: TripVisibility;
  // Pending columns (see SCHEMA NOTES above):
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupMemberRole;
  joined_at: string;
  profiles?: MemberProfile | null;
}

// Composite types returned by fetch functions

export interface TripWithDetails extends Trip {
  trip_details: TripDetails | null;
}

export interface TripWithEverything extends TripWithDetails {
  group_members: GroupMember[];
}

// Input types

export interface CreateTripInput {
  name: string;
  description?: string;
}

export interface UpdateTripInput {
  name?: string;
  description?: string;
  cover_image_url?: string | null;
}

export interface UpdateTripDetailsInput {
  start_date?: string | null;
  end_date?: string | null;
  budget?: number | null;
  currency?: string;
  notes?: string | null;
  cover_image_url?: string | null;
  visibility?: TripVisibility;
}

export interface UpdateDestinationInput {
  destination_label: string;
  destination_place_id?: string;
  destination_address?: string;
}

// Shared result wrapper

export interface ActionResult<T> {
  data: T | null;
  error: string | null;
}

/**
 * Inserts a groups row (type='trip'). The DB trigger
 * trg_create_trip_details auto-creates the trip_details row
 * (currency='GBP', visibility='private'). Creator is added to
 * group_members as 'owner'. On member insert failure the groups
 * row is cleaned up.
 */

export async function createTrip(
  userId: string,
  input: CreateTripInput
): Promise<ActionResult<TripWithDetails>> {
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({
      type: 'trip',
      name: input.name,
      description: input.description ?? null,
      created_by: userId,
    })
    .select('*, trip_details(*)')
    .single();

  if (groupError) {
    console.log('Error creating trip: ', groupError, userId);
    return { data: null, error: groupError.message };
  }

  return { data: group as TripWithDetails, error: null };
}

/** Returns all trips where created_by = userId, newest first. */

export async function fetchMyTrips(
  userId: string
): Promise<ActionResult<TripWithEverything[]>> {
  const { data, error } = await supabase
    .from('groups')
    .select(
      '*, trip_details(*), group_members(*, profiles(id, full_name, avatar_url))'
    )
    .eq('type', 'trip')
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as TripWithEverything[], error: null };
}

/**
 * Returns trips the user is a member of but did NOT create.
 * Queries via group_members to respect RLS, then filters owned
 * trips in JS (cross-table .neq() is unreliable in PostgREST).
 */

export async function fetchJoinedTrips(
  userId: string
): Promise<ActionResult<TripWithEverything[]>> {
  const { data: memberRows, error: memberError } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId);

  if (memberError) return { data: null, error: memberError.message };

  const groupIds = (memberRows ?? []).map((r) => r.group_id);
  if (groupIds.length === 0) return { data: [], error: null };

  const { data, error } = await supabase
    .from('groups')
    .select(
      '*, trip_details(*), group_members(*, profiles(id, full_name, avatar_url))'
    )
    .eq('type', 'trip')
    .neq('created_by', userId)
    .in('id', groupIds)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as TripWithEverything[], error: null };
}

/** Returns a single trip with its trip_details and all group_members. */

export async function fetchTripById(
  groupId: string
): Promise<ActionResult<TripWithEverything>> {
  const { data, error } = await supabase
    .from('groups')
    .select(
      '*, trip_details(*), group_members(*, profiles(id, full_name, avatar_url))'
    )
    .eq('id', groupId)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as TripWithEverything, error: null };
}

/** Updates name / description on the groups row. */

export async function updateTrip(
  groupId: string,
  input: UpdateTripInput
): Promise<ActionResult<Trip>> {
  const { data, error } = await supabase
    .from('groups')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', groupId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Trip, error: null };
}

/**
 * Updates budget, currency, dates, notes, visibility on trip_details.
 * Identified by group_id (= groups.id), not trip_details.id.
 */

export async function updateTripDetails(
  groupId: string,
  input: UpdateTripDetailsInput
): Promise<ActionResult<TripDetails>> {
  const { data, error } = await supabase
    .from('trip_details')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('group_id', groupId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as TripDetails, error: null };
}

/** Updates destination_label, destination_place_id, destination_address on the groups row. */

export async function updateDestination(
  groupId: string,
  place: UpdateDestinationInput
): Promise<ActionResult<Trip>> {
  const { data, error } = await supabase
    .from('groups')
    .update({
      destination_label: place.destination_label,
      destination_place_id: place.destination_place_id ?? null,
      destination_address: place.destination_address ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', groupId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Trip, error: null };
}

/**
 * Hard-deletes the groups row. Cascades to trip_details,
 * group_members, itineraries, saved_itinerary_items via FK ON DELETE
 * CASCADE.
 */

export async function deleteTrip(groupId: string): Promise<ActionResult<null>> {
  const { error } = await supabase.from('groups').delete().eq('id', groupId);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

/**
 * Removes a user's own group_members row (self-leave).
 * To remove another user, use removeMember().
 */

export async function leaveTrip(
  groupId: string,
  userId: string
): Promise<ActionResult<null>> {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

/** Inserts a group_members row. Defaults role to 'member'. */

export async function addMember(
  groupId: string,
  userId: string,
  role: GroupMemberRole = 'member'
): Promise<ActionResult<GroupMember>> {
  const { data, error } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, user_id: userId, role })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as GroupMember, error: null };
}

/** Changes an existing member's role. Requires the caller to be an admin or owner (enforced by RLS). */

export async function updateMemberRole(
  groupId: string,
  userId: string,
  role: GroupMemberRole
): Promise<ActionResult<GroupMember>> {
  const { data, error } = await supabase
    .from('group_members')
    .update({ role })
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as GroupMember, error: null };
}

/**
 * Removes another user from the group. Requires the caller to be
 * an admin or owner (enforced by RLS). Use leaveTrip() for
 * self-removal.
 */

export async function removeMember(
  groupId: string,
  userId: string
): Promise<ActionResult<null>> {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}
