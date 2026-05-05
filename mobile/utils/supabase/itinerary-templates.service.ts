import { ItineraryTemplate } from "@/types/content.types";
import { supabase } from "./client";

// Map snake_case DB row → camelCase ItineraryTemplate
// Note: daily_itinerary → dailyItinerary, review_count → reviewCount
function mapRow(row: any): ItineraryTemplate {
  return {
    id: row.id,
    title: row.title,
    location: row.location ?? "",
    duration: row.duration ?? "",
    category: row.category ?? "",
    image: row.image ?? "",
    rating: row.rating ? Number(row.rating) : 0,
    reviewCount: row.review_count ?? 0,
    activities: row.activities ?? 0,
    description: row.description ?? "",
    featured: row.featured ?? false,
    included: Array.isArray(row.included) ? row.included : [],
    dailyItinerary: Array.isArray(row.daily_itinerary) ? row.daily_itinerary : [],
    locationLat: row.location_lat ?? row.locationlat,
    locationLng: row.location_lng ?? row.locationlng,
    durationMinutes: row.duration_minutes ?? row.durationminutes,
    cost: row.cost ? Number(row.cost) : undefined,
    currency: row.currency ?? "",
    bookingReference: row.booking_reference ?? row.bookingreference,
    cols: row.cols,
  };
}

export const getItineraryTemplates = async (): Promise<ItineraryTemplate[]> => {
  const { data, error } = await supabase
    .from("itinerary_templates")
    .select("*")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
};

export const getFeaturedItineraryTemplates = async (): Promise<ItineraryTemplate[]> => {
  const { data, error } = await supabase
    .from("itinerary_templates")
    .select("*")
    .eq("featured", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
};

export const getItineraryTemplateById = async (
  id: string
): Promise<ItineraryTemplate | null> => {
  const { data, error } = await supabase
    .from("itinerary_templates")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw new Error(error.message);
  }
  return data ? mapRow(data) : null;
};

export const searchItineraryTemplates = async (
  query: string
): Promise<ItineraryTemplate[]> => {
  const { data, error } = await supabase
    .from("itinerary_templates")
    .select("*")
    .or(`title.ilike.%${query}%,location.ilike.%${query}%,category.ilike.%${query}%`)
    .order("featured", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
};
