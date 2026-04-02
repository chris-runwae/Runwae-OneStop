import { Destination } from "@/types/content.types";
import { supabase } from "./client";

// Map snake_case DB row → camelCase Destination
function mapRow(row: any): Destination {
  return {
    id: row.id,
    title: row.title,
    location: row.location,
    image: row.image,
    rating: row.rating ? Number(row.rating) : undefined,
    reviewCount: row.review_count,
    description: row.description,
    featured: row.featured,
  };
}

export const getDestinations = async (): Promise<Destination[]> => {
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
};

export const getFeaturedDestinations = async (): Promise<Destination[]> => {
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .eq("featured", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
};

export const getDestinationById = async (id: string): Promise<Destination | null> => {
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw new Error(error.message);
  }
  return data ? mapRow(data) : null;
};

export const searchDestinations = async (query: string): Promise<Destination[]> => {
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .or(`title.ilike.%${query}%,location.ilike.%${query}%`)
    .order("featured", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
};

export const getSimilarDestinations = async (
  excludeId: string
): Promise<Destination[]> => {
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .neq("id", excludeId)
    .limit(5);

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
};
