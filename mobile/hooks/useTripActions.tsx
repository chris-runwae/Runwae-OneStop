import { supabase } from '@/utils/supabase/client';
import type { LiteAPIPlace } from '@/hooks/usePlacesAutoComplete';

export type GroupVisibility = 'public' | 'private';
export type GroupType = 'trip' | 'event';
export type MemberRole = 'owner' | 'admin' | 'member';

export type TripDetails = {
  id: string;
  group_id: string;
  start_date: string | null;
  end_date: string | null;
  destination_label: string | null;
  destination_place_id: string | null;
  destination_address: string | null;
  budget: number | null;
  currency: string;
};

export type GroupMember = {
  group_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
  profiles: {
    id: string;
    name: string;
    username: string;
    profile_image_url: string | null;
  };
};

export type Trip = {
  id: string;
  name: string;
  description: string | null;
  visibility: GroupVisibility;
  cover_image_url: string | null;
  owner_id: string;
  created_at: string;
  trip_details?: TripDetails | null;
  group_members?: GroupMember[];
};

export type CreateTripInput = {
  name: string;
  description?: string;
  cover_image_url?: string;
  visibility?: GroupVisibility;
};

export type UpdateTripInput = {
  name?: string;
  description?: string;
  cover_image_url?: string;
  visibility?: GroupVisibility;
};

export type UpdateTripDetailsInput = {
  start_date?: string | null;
  end_date?: string | null;
  budget?: number | null;
  currency?: string;
  cover_image_url?: string | null;
};

// No hook — just exported async functions that accept userId where needed
export const TripActions = {
  createTrip: async (userId: string, input: CreateTripInput): Promise<Trip> => {
    const { data, error } = await supabase
      .from('groups')
      .insert({
        type: 'trip',
        name: input.name,
        description: input.description ?? null,
        cover_image_url: input.cover_image_url ?? null,
        visibility: input.visibility ?? 'public',
        owner_id: userId,
      })
      .select('*, trip_details(*)')
      .single();
    if (error) throw error;
    return data as Trip;
  },

  fetchMyTrips: async (userId: string): Promise<Trip[]> => {
    const { data, error } = await supabase
      .from('groups')
      .select('*, trip_details(*), group_members(*, profiles(id, name, username, profile_image_url))')
      .eq('type', 'trip')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Trip[];
  },

  fetchJoinedTrips: async (userId: string): Promise<Trip[]> => {
    const { data, error } = await supabase
      .from('group_members')
      .select('group:group_id(*, trip_details(*), group_members(*, profiles(id, name, username, profile_image_url)))')
      .eq('user_id', userId)
      .neq('role', 'owner'); // exclude trips they own — fetchMyTrips covers those
    if (error) throw error;
    return data?.map((row: any) => row.group).filter(Boolean) as Trip[];
  },

  fetchTripById: async (groupId: string): Promise<Trip> => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*, trip_details(*), group_members(*, profiles(id, name, username, profile_image_url))')
        .eq('id', groupId)
        .eq('type', 'trip')
        .single();
      if (error) throw error;
      return data as Trip;
    } catch (error) {
      console.error("Failed to fetch trip by ID:", error);
      throw error;  
    }
  },

  updateTrip: async (groupId: string, input: UpdateTripInput): Promise<Trip> => {
    const { data, error } = await supabase
      .from('groups')
      .update(input)
      .eq('id', groupId)
      .select()
      .single();
    if (error) throw error;
    return data as Trip;
  },

  updateTripDetails: async (groupId: string, input: UpdateTripDetailsInput): Promise<TripDetails> => {
    const { data, error } = await supabase
      .from('trip_details')
      .update(input)
      .eq('group_id', groupId)
      .select()
      .single();
    if (error) throw error;
    return data as TripDetails;
  },

  updateDestination: async (groupId: string, place: LiteAPIPlace): Promise<TripDetails> => {
    const { data, error } = await supabase
      .from('trip_details')
      .update({
        destination_label: `${place.displayName}, ${place.formattedAddress}`,
        destination_place_id: place.placeId,
        destination_address: place.formattedAddress,
      })
      .eq('group_id', groupId)
      .select()
      .single();
    if (error) throw error;
    return data as TripDetails;
  },

  deleteTrip: async (groupId: string, userId: string): Promise<void> => {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId)
      .eq('owner_id', userId);
    if (error) throw error;
  },

  leaveTrip: async (groupId: string, userId: string): Promise<void> => {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  updateMemberRole: async (groupId: string, targetUserId: string, role: MemberRole) => {
    const { data, error } = await supabase
      .from('group_members')
      .update({ role })
      .eq('group_id', groupId)
      .eq('user_id', targetUserId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  removeMember: async (groupId: string, targetUserId: string): Promise<void> => {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', targetUserId);
    if (error) throw error;
  },
};