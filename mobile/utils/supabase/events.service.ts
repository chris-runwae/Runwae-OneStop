import { Event } from "@/types/content.types";
import { supabase } from "./client";

function mapRow(row: any): Event {
  return {
    id: row.id,
    title: row.title,
    location: row.location ?? "",
    date: row.date ?? "",
    time: row.time ?? "",
    category: row.category ?? "",
    image: row.image ?? "",
    latitude: row.latitude ? Number(row.latitude) : 0,
    longitude: row.longitude ? Number(row.longitude) : 0,
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
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw new Error(error.message);
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
