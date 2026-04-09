import { supabase } from "./client";

export interface EventData {
  user_id: string;
  name: string;
  start_date: string;
  location?: string;
  description?: string;
  cover_image_url?: string;
  category?: string;
  ticket_link?: string;
  event_link?: string;
}

export interface Event {
  id: string;
  name: string;
  start_date: string;
  location: string | null;
  cover_image_url: string | null;
  status: string | null;
  description: string | null;
  category: string | null;
}

export const getEvents = async (
  userId: string,
  filter?: string,
): Promise<Event[]> => {
  const now = new Date().toISOString();

  let query = supabase
    .from("events")
    .select(
      "id, name, start_date, location, cover_image_url, status, description, category",
    )
    .eq("user_id", userId)
    .order("start_date", { ascending: true });

  if (filter === "Published") query = query.eq("status", "published");
  if (filter === "Upcoming") query = query.gt("start_date", now);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
};

export const createEvent = async (event: EventData) => {
  try {
    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          user_id: event.user_id,
          name: event.name,
          start_date: event.start_date,
          location: event.location,
          description: event.description || "",
          cover_image_url: event.cover_image_url,
          category: event.category,
          ticket_link: event.ticket_link,
          event_link: event.event_link,
          status: "draft",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating event:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error creating event:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
};

export const updateEvent = async (
  id: string,
  updates: Partial<EventData & { status: string }>,
) => {
  try {
    const { data, error } = await supabase
      .from("events")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating event:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error updating event:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
};

export const deleteEvent = async (id: string) => {
  try {
    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      console.error("Error deleting event:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error deleting event:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
};
