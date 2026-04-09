import { supabase } from "./client";

export type Event = {
  id: string;
  name: string;
  start_date: string | null;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  location: string | null;
  image: string | null;
  status: string | null;
  description: string | null;
  category: string | null;
  slug: string | null;
  latitude: number | null;
  longitude: number | null;
  bookings: boolean | null;
};

export type CreateEventData = {
  user_id: string;
  name: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  location: string;
  description: string;
  category: string;
  image: string | null;
  ticket_link?: string | null;
  latitude: number | null;
  longitude: number | null;
  bookings: boolean;
  status?: string;
};

export const getEvents = async (userId: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, name, start_date, start_time, end_date, end_time, location, image, status, description, category, slug, latitude, longitude, bookings",
    )
    .eq("user_id", userId)
    .order("start_date", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
};

export const createEvent = async (event: CreateEventData): Promise<Event> => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  console.log("session:", session);
  console.log("session error:", sessionError);
  console.log("user id:", session?.user?.id);
  console.log("event user_id being sent:", event.user_id);

  const { data, error } = await supabase
    .from("events")
    .insert({ ...event, status: event.status ?? "draft" })
    .select()
    .single();

  console.log("data:", data);
  console.log("error:", error);

  if (error) throw new Error(error.message);
  return data;
};

export const updateEvent = async (
  id: string,
  updates: Partial<CreateEventData>,
): Promise<Event> => {
  const { data, error } = await supabase
    .from("events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);
};
