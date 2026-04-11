import { EVENT_VISIBILITY } from "@/lib/enums";
import type { Event } from "@/lib/supabase/events";
import z from "zod";

export const createEventSchema = z.object({
  eventName: z.string().min(1, "Event name is required."),
  startDate: z.string().min(1, "Start date is required."),
  startTime: z.string().min(1, "Start time is required."),
  endDate: z.string().min(1, "End date is required."),
  endTime: z.string().min(1, "End time is required."),
  location: z.string().min(2, "Location is required."),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters.")
    .max(500, "Description cannot exceed 500 characters."),
  category: z.string().min(1, "Please select a category."),
  ticketLink: z.string().optional(),
  eventSlug: z.string().optional(),
  bookings: z.boolean().default(false),
  visibility: z.nativeEnum(EVENT_VISIBILITY),
  bannerImage: z.instanceof(File).nullable(),
});

export const createEventDefaultValues = {
  eventName: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  location: "",
  description: "",
  category: "",
  ticketLink: "",
  eventSlug: "",
  bookings: false,
  visibility: EVENT_VISIBILITY.PUBLIC,
  bannerImage: null,
};

export function mapEventRowToFormValues(
  event: Event,
  opts: { duplicate: boolean },
): z.infer<typeof createEventSchema> {
  return {
    eventName: opts.duplicate ? `${event.name} (Copy)` : event.name,
    startDate: event.start_date ?? "",
    startTime: event.start_time ?? "",
    endDate: event.end_date ?? "",
    endTime: event.end_time ?? "",
    location: event.location ?? "",
    description: event.description ?? "",
    category: event.category ?? "",
    ticketLink: event.ticket_link ?? "",
    eventSlug: "",
    bookings: event.bookings ?? false,
    visibility: EVENT_VISIBILITY.PUBLIC,
    bannerImage: null,
  };
}
