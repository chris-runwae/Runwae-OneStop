import { supabase } from "../client";
import type { HotelBooking } from "../hotel-bookings";

const HOTEL_BOOKING_COLUMNS =
  "id, hotel_name, hotel_id, booking_ref, confirmation_code, checkin, checkout, guests, room_count, currency, total_amount, status, booking_type, trip_id, event_id, created_at";

export const adminGetAllHotelBookings = async (): Promise<HotelBooking[]> => {
  const { data, error } = await supabase
    .from("hotel_bookings")
    .select(HOTEL_BOOKING_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as HotelBooking[];
};
