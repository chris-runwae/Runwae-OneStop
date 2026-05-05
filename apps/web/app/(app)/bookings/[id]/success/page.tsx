import type { Metadata } from "next";
import type { Id } from "@/convex/_generated/dataModel";
import { BookingSuccessClient } from "@/components/bookings/BookingSuccessClient";

export const metadata: Metadata = { title: "Booking" };

export default async function BookingSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookingSuccessClient bookingId={id as Id<"bookings">} />;
}
