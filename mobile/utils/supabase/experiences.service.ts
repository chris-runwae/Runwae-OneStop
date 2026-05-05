import { Experience, Review } from "@/types/content.types";
import { supabase } from "./client";

// Map snake_case DB row → camelCase Experience
// Reviews are embedded via a joined select or passed separately.
function mapRow(row: any, reviews: Review[] = []): Experience {
  return {
    id: row.id,
    title: row.title,
    category: row.category ?? "",
    rating: row.rating ? Number(row.rating) : 0,
    reviewCount: row.review_count ?? 0,
    description: row.description ?? "",
    image: row.image ?? "",
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    price: row.price ? Number(row.price) : 0,
    featured: row.featured ?? false,
    destinationId: row.destination_id ?? undefined,
    included: Array.isArray(row.included) ? row.included : [],
    whatToKnow: Array.isArray(row.what_to_know) ? row.what_to_know : [],
    itinerary: Array.isArray(row.itinerary) ? row.itinerary : [],
    reviews,
    location: row.location ?? "",
    locationLat: row.location_lat ?? row.locationlat,
    locationLng: row.location_lng ?? row.locationlng,
    durationMinutes: row.duration_minutes ?? row.durationminutes,
    cost: row.cost ? Number(row.cost) : undefined,
    currency: row.currency ?? "",
    bookingReference: row.booking_reference ?? row.bookingreference,
    cols: row.cols,
  };
}

function mapReview(r: any): Review {
  return {
    id: r.id,
    name: r.name ?? "",
    username: r.username ?? "",
    avatar: r.avatar ?? "",
    rating: r.rating ?? 0,
    comment: r.comment ?? "",
    date: r.review_date ?? "",
  };
}

export const getExperiences = async (): Promise<Experience[]> => {
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapRow(row));
};

export const getFeaturedExperiences = async (): Promise<Experience[]> => {
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .eq("featured", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapRow(row));
};

export const getExperienceById = async (id: string): Promise<Experience | null> => {
  const [expResult, reviewsResult] = await Promise.all([
    supabase.from("experiences").select("*").eq("id", id).single(),
    supabase
      .from("reviews")
      .select("*")
      .eq("entity_type", "experience")
      .eq("entity_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (expResult.error) {
    if (expResult.error.code === "PGRST116") return null; // not found
    console.error("getExperienceById: Supabase error:", expResult.error);
    throw new Error(expResult.error.message);
  }

  const reviews = (reviewsResult.data ?? []).map(mapReview);
  return expResult.data ? mapRow(expResult.data, reviews) : null;
};

export const searchExperiences = async (query: string): Promise<Experience[]> => {
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .or(`title.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`)
    .order("featured", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapRow(row));
};

export const getExperiencesByDestination = async (
  destinationId: string
): Promise<Experience[]> => {
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .eq("destination_id", destinationId)
    .order("rating", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapRow(row));
};
