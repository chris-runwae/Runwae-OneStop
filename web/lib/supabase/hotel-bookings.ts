import { supabase } from "./client";

export type HotelBooking = {
  id: string;
  hotel_name: string | null;
  hotel_id: string | null;
  booking_ref: string | null;
  confirmation_code: string | null;
  checkin: string | null;
  checkout: string | null;
  guests: number | null;
  room_count: number | null;
  currency: string | null;
  total_amount: number | null;
  status: string | null;
  booking_type: string | null;
  trip_id: string | null;
  event_id: string | null;
  created_at: string | null;
};

const HOTEL_BOOKING_COLUMNS =
  "id, hotel_name, hotel_id, booking_ref, confirmation_code, checkin, checkout, guests, room_count, currency, total_amount, status, booking_type, trip_id, event_id, created_at";

export const getHotelBookings = async (): Promise<HotelBooking[]> => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw new Error(authError.message);
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("hotel_bookings")
    .select(HOTEL_BOOKING_COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
};
