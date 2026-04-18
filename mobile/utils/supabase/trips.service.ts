import { supabase } from "./client";
import { uploadTripImage } from "./storage";

export interface TripData {
  user_id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  cover_img_url?: string;
  description?: string;
}

export interface TripInvitePreview {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
}

export async function getTripByJoinCode(code: string): Promise<TripInvitePreview | null> {
  const { data, error } = await supabase
    .rpc('get_group_by_join_code', { p_code: code.toUpperCase().trim() });

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return null;

  const row = data[0];
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    memberCount: Number(row.member_count),
  };
}

export async function joinTripByCode(code: string, userId: string): Promise<string> {
  const preview = await getTripByJoinCode(code);
  if (!preview) throw new Error('Invalid invite code. Check the link and try again.');

  // Check if already a member
  const { data: existing } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', preview.id)
    .eq('user_id', userId)
    .single();

  if (existing) return preview.id; // already a member — navigate silently

  const { error } = await supabase
    .from('group_members')
    .insert({ group_id: preview.id, user_id: userId, role: 'member' });

  if (error) throw new Error(error.message);
  return preview.id;
}

export const createTrip = async (trip: TripData) => {
  try {
    let finalImageUrl = trip.cover_img_url;

    if (trip.cover_img_url && !trip.cover_img_url.startsWith("http")) {
      try {
        finalImageUrl = await uploadTripImage(trip.user_id, trip.cover_img_url);
      } catch (uploadError) {
        console.error("Error uploading trip image:", uploadError);
        throw new Error("Failed to upload trip image");
      }
    }

    const { data, error } = await supabase
      .from("trips")
      .insert([
        {
          user_id: trip.user_id,
          title: trip.title,
          destination: trip.destination,
          start_date: trip.start_date,
          end_date: trip.end_date,
          cover_image_url: finalImageUrl,
          description: trip.description || "",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error inserting trip:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Unexpected error creating trip:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
};
