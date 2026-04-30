import { supabase } from "./client";

export type ItineraryStat = {
  label: string;
  count: number;
};

export type LocationStat = {
  label: string;
  value: number;
};

export type HotelBookingItem = {
  guests: number | null;
  created_at: string | null;
};

export type AttendeeInsights = {
  totalAttendees: number;
  tripsPlanned: number;
  bookingsMade: number;
  topItineraries: ItineraryStat[];
  topLocations: LocationStat[];
  // raw rows for period filtering in the UI
  eventRows: { current_participants: number | null; start_date: string | null }[];
  itineraryRows: { id: string; created_at: string | null }[];
  hotelRows: HotelBookingItem[];
};

// Extracts the last meaningful segment of a location string as the city/country label.
// e.g. "Efab Estate, 25 1st Ave, Abuja" → "Abuja"
function parseLocation(location: string | null): string {
  if (!location) return "Unknown";
  const parts = location.split(",").map((s) => s.trim()).filter(Boolean);
  return parts[parts.length - 1] ?? location;
}

export const getAttendeeInsights = async (
  userId: string,
  eventId?: string,
): Promise<AttendeeInsights> => {
  // Build events query — optionally scoped to one event
  let eventsQuery = supabase
    .from("events")
    .select("id, name, start_date, current_participants, location, latitude, longitude")
    .eq("user_id", userId);
  if (eventId) eventsQuery = eventsQuery.eq("id", eventId);

  const [eventsRes, itinRes] = await Promise.all([
    eventsQuery,
    supabase
      .from("itinerary_items")
      .select("id, name, title, created_at")
      .eq("external_id", userId),
  ]);

  if (eventsRes.error) throw new Error(eventsRes.error.message);

  const eventRows = eventsRes.data ?? [];
  const itineraries = itinRes.data ?? [];

  const totalAttendees = eventRows.reduce(
    (sum, e) => sum + ((e.current_participants as number) ?? 0),
    0,
  );

  // Hotel bookings scoped to visible events
  let hotelRows: HotelBookingItem[] = [];
  let bookingsMade = 0;
  if (eventRows.length > 0) {
    const eventIds = eventRows.map((e) => e.id);
    const { data: hotelsData, error: hotelsError } = await supabase
      .from("hotel_bookings")
      .select("guests, created_at")
      .in("event_id", eventIds);
    if (hotelsError) throw new Error(hotelsError.message);
    hotelRows = (hotelsData ?? []) as HotelBookingItem[];
    bookingsMade = hotelRows.reduce((sum, b) => sum + (b.guests ?? 0), 0);
  }

  // Top locations — group by parsed location label, sum participants, exclude zeros
  const locationMap = new Map<string, number>();
  for (const e of eventRows) {
    const label = parseLocation(e.location as string | null);
    locationMap.set(label, (locationMap.get(label) ?? 0) + ((e.current_participants as number) ?? 0));
  }
  const topLocations: LocationStat[] = Array.from(locationMap.entries())
    .map(([label, value]) => ({ label, value }))
    .filter((l) => l.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Top itineraries
  const topItineraries: ItineraryStat[] = itineraries
    .map((it) => ({
      label:
        (it as { name?: string; title?: string }).name ||
        (it as { name?: string; title?: string }).title ||
        "Untitled",
      count: 1,
    }))
    .reduce<ItineraryStat[]>((acc, cur) => {
      const existing = acc.find((a) => a.label === cur.label);
      if (existing) existing.count += 1;
      else acc.push(cur);
      return acc;
    }, [])
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalAttendees,
    tripsPlanned: itineraries.length,
    bookingsMade,
    topItineraries,
    topLocations,
    eventRows: eventRows.map((e) => ({
      current_participants: (e.current_participants as number | null),
      start_date: (e.start_date as string | null),
    })),
    itineraryRows: itineraries.map((it) => ({
      id: it.id as string,
      created_at: (it as { created_at?: string | null }).created_at ?? null,
    })),
    hotelRows,
  };
};
