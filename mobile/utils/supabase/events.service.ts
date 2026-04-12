import { Event } from "@/types/content.types";
import { formatDateRange } from "../date";
import { supabase } from "./client";

function mapRow(row: any): Event {
  const start = row.start_date ?? row.date;
  const end = row.end_date ?? start;

  return {
    id: row.id,
    title: row.title ?? row.name ?? "",
    location: row.destination ?? row.location ?? "",
    date: formatDateRange(start, end),
    time: row.time ?? "",
    category: row.category ?? "",
    image: row.cover_image_url ?? row.image ?? "",
    latitude: row.latitude ? Number(row.latitude) : 0,
    longitude: row.longitude ? Number(row.longitude) : 0,
    description: row.description ?? "",
    // Rich detail fields
    price: row.price != null ? Number(row.price) : undefined,
    currency: row.currency ?? undefined,
    maxParticipants: row.max_participants ?? undefined,
    currentParticipants: row.current_participants ?? undefined,
    imageUrls: Array.isArray(row.image_urls) ? row.image_urls : undefined,
    highlights: Array.isArray(row.highlights) ? row.highlights : undefined,
    whatsIncluded: Array.isArray(row.whats_included) ? row.whats_included : undefined,
    requirements: Array.isArray(row.requirements) ? row.requirements : undefined,
    difficultyLevel: row.difficulty_level ?? undefined,
    itinerary: Array.isArray(row.itinerary) ? row.itinerary : undefined,
    status: row.status ?? undefined,
    isFeatured: row.is_featured ?? undefined,
    featuredOrder: row.featured_order ?? undefined,
    publishedAt: row.published_at ?? undefined,
  };
}

export const getEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
};

export const getEventById = async (id: string): Promise<Event | null> => {
  // Try 'events' table first
  let { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(error.message);
  }

  // If not found in 'events', try 'featured_events'
  if (!data) {
    const { data: featuredData, error: featuredError } = await supabase
      .from("featured_events")
      .select("*")
      .eq("id", id)
      .single();

    if (featuredError) {
      if (featuredError.code === "PGRST116") return null;
      throw new Error(featuredError.message);
    }
    data = featuredData;
  }

  return data ? mapRow(data) : null;
};

export const getEventsByCategory = async (category: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
};

export const searchEvents = async (query: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .or(`title.ilike.%${query}%,location.ilike.%${query}%,category.ilike.%${query}%`)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
};

export const getFeaturedEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from("featured_events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map(mapRow);
};
