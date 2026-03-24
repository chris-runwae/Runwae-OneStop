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
