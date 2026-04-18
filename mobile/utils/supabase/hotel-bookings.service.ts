import type { HotelBookingPayload, HotelBookingRecord } from "@/types/hotel.types";
import { supabase } from "./client";

function mapRow(row: Record<string, unknown>): HotelBookingRecord {
  return {
    id: row.id as string,
    tripId: row.trip_id as string | null,
    userId: row.user_id as string,
    vendorId: (row.vendor_id as string | null) ?? null,
    eventId: (row.event_id as string | null) ?? null,
    hotelId: row.hotel_id as string,
    hotelName: row.hotel_name as string,
    bookingRef: row.booking_ref as string,
    confirmationCode: (row.confirmation_code as string | null) ?? null,
    prebookId: row.prebook_id as string,
    transactionId: (row.transaction_id as string | null) ?? null,
    checkin: row.checkin as string,
    checkout: row.checkout as string,
    guests: row.guests as number,
    roomCount: row.room_count as number,
    currency: row.currency as string,
    totalAmount: row.total_amount as number,
    commissionAmount: (row.commission_amount as number | null) ?? null,
    bookingType: row.booking_type as "individual" | "group",
    rawResponse: (row.raw_response as object | null) ?? null,
    status: row.status as "pending" | "confirmed" | "cancelled",
    createdAt: row.created_at as string,
  };
}

export async function logHotelBooking(
  payload: HotelBookingPayload,
): Promise<HotelBookingRecord> {
  const { data, error } = await supabase
    .from("hotel_bookings")
    .insert({
      trip_id: payload.tripId,
      user_id: payload.userId,
      vendor_id: payload.vendorId ?? null,
      event_id: payload.eventId ?? null,
      hotel_id: payload.hotelId,
      hotel_name: payload.hotelName,
      booking_ref: payload.bookingRef,
      confirmation_code: payload.confirmationCode ?? null,
      prebook_id: payload.prebookId,
      transaction_id: payload.transactionId ?? null,
      checkin: payload.checkin,
      checkout: payload.checkout,
      guests: payload.guests,
      room_count: payload.roomCount,
      currency: payload.currency,
      total_amount: payload.totalAmount,
      commission_amount: payload.commissionAmount ?? null,
      booking_type: payload.bookingType,
      raw_response: payload.rawResponse ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message || "Failed to log hotel booking");
  return mapRow(data as Record<string, unknown>);
}

export async function getUserHotelBookings(
  userId: string,
): Promise<HotelBookingRecord[]> {
  const { data, error } = await supabase
    .from("hotel_bookings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message || "Failed to fetch hotel bookings");
  return (data as Record<string, unknown>[]).map(mapRow);
}
