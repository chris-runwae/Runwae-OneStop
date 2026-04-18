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
  ticket_link?: string | null;
  user_id?: string;
};

export type EventHostRow = {
  id: string;
  event_id: string;
  name: string;
  email: string;
  show_on_page: boolean;
  is_manager: boolean;
  created_at: string;
};

export type EventSubEventRow = {
  id: string;
  event_id: string;
  name: string;
  starts_at: string | null;
  created_at: string;
};

export type EventDetail = Event & {
  event_hosts: EventHostRow[];
  event_sub_events: EventSubEventRow[];
};

const EVENT_DETAIL_BASE =
  "id, user_id, name, start_date, start_time, end_date, end_time, location, image, status, description, category, slug, latitude, longitude, bookings, ticket_link";

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
      "id, name, start_date, start_time, end_date, end_time, location, image, status, description, category, slug, latitude, longitude, bookings, ticket_link",
    )
    .eq("user_id", userId)
    .order("start_date", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
};

/** Single event row for the signed-in owner (forms, duplicate, etc.). */
export const getEventRowForOwner = async (
  eventId: string,
  userId: string,
): Promise<Event | null> => {
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, user_id, name, start_date, start_time, end_date, end_time, location, image, status, description, category, slug, latitude, longitude, bookings, ticket_link",
    )
    .eq("id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Event | null;
};

/**
 * Event row + hosts + sub-events for the host dashboard.
 * Requires tables `event_hosts` and `event_sub_events` — see
 * `supabase/migrations/20260411000000_event_hosts_and_sub_events.sql`.
 */
export const getEventDetailForOwner = async (
  eventId: string,
  userId: string,
): Promise<EventDetail | null> => {
  const { data: event, error } = await supabase
    .from("events")
    .select(EVENT_DETAIL_BASE)
    .eq("id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!event) return null;

  const [hostsRes, subsRes] = await Promise.all([
    supabase
      .from("event_hosts")
      .select("id, event_id, name, email, show_on_page, is_manager, created_at")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true }),
    supabase
      .from("event_sub_events")
      .select("id, event_id, name, starts_at, created_at")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true }),
  ]);

  if (hostsRes.error) throw new Error(hostsRes.error.message);
  if (subsRes.error) throw new Error(subsRes.error.message);

  return {
    ...(event as Event),
    event_hosts: (hostsRes.data ?? []) as EventHostRow[],
    event_sub_events: (subsRes.data ?? []) as EventSubEventRow[],
  };
};

export type NewEventHostInput = {
  event_id: string;
  name: string;
  email: string;
  show_on_page: boolean;
  is_manager: boolean;
};

export const insertEventHost = async (
  input: NewEventHostInput,
): Promise<EventHostRow> => {
  const { data, error } = await supabase
    .from("event_hosts")
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as EventHostRow;
};

export const updateEventHost = async (
  id: string,
  updates: Partial<
    Pick<EventHostRow, "name" | "email" | "show_on_page" | "is_manager">
  >,
): Promise<EventHostRow> => {
  const { data, error } = await supabase
    .from("event_hosts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as EventHostRow;
};

export const deleteEventHost = async (id: string): Promise<void> => {
  const { error } = await supabase.from("event_hosts").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

export type NewEventSubEventInput = {
  event_id: string;
  name: string;
  starts_at: string | null;
};

export const insertEventSubEvent = async (
  input: NewEventSubEventInput,
): Promise<EventSubEventRow> => {
  const { data, error } = await supabase
    .from("event_sub_events")
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as EventSubEventRow;
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
  userId: string,
  updates: Partial<CreateEventData>,
): Promise<Event> => {
  const { data, error } = await supabase
    .from("events")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Event not found or not authorized");

  return data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);
};
