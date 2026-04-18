import { supabase } from "../client";
import type { Event } from "../events";

const EVENT_COLS =
  "id, user_id, name, start_date, start_time, end_date, end_time, location, image, status, description, category, slug, latitude, longitude, bookings, ticket_link";

/** All events across every host — no user_id filter. */
export const adminGetAllEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_COLS)
    .order("start_date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Event[];
};

/** Single event by ID regardless of owner. */
export const adminGetEvent = async (id: string): Promise<Event | null> => {
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_COLS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Event | null;
};

/** Update any event regardless of owner — admin only. */
export const adminUpdateEvent = async (
  id: string,
  updates: Partial<{
    name: string;
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
    location: string;
    description: string;
    category: string;
    ticket_link: string | null;
    bookings: boolean;
    latitude: number | null;
    longitude: number | null;
    image: string;
    status: string;
  }>,
): Promise<Event> => {
  const { data, error } = await supabase
    .from("events")
    .update(updates)
    .eq("id", id)
    .select(EVENT_COLS)
    .single();

  if (error) throw new Error(error.message);
  return data as Event;
};

export type AdminEventFilters = {
  status?: string;
  search?: string;
  location?: string;
};

export const adminGetFilteredEvents = async (
  filters: AdminEventFilters = {},
): Promise<Event[]> => {
  let query = supabase.from("events").select(EVENT_COLS);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.location) query = query.ilike("location", `%${filters.location}%`);
  if (filters.search) query = query.ilike("name", `%${filters.search}%`);

  const { data, error } = await query.order("start_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Event[];
};
