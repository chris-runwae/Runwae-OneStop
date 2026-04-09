import { EVENT_VISIBILITY } from "@/lib/enums";

export const VISIBILITY_OPTIONS = [
  { value: EVENT_VISIBILITY.PUBLIC, label: "Public" },
  { value: EVENT_VISIBILITY.PRIVATE, label: "Private" },
] as const;

export const EVENT_CATEGORIES = [
  { value: "festival", label: "Festival" },
  { value: "conference", label: "Conference" },
  { value: "concert", label: "Concert" },
  { value: "retreat", label: "Retreat" },
  { value: "sports", label: "Sports" },
  { value: "cultural", label: "Cultural" },
  { value: "other", label: "Other" },
] as const;

export const BOOKINGS_OPTIONS = [
  { value: "enable", label: "Enable bookings" },
  { value: "disable", label: "Disable bookings" },
] as const;

export const EVENT_LINK_BASE = "runwae.io/events";

export function eventSlugFromName(name: string): string {
  if (!name.trim()) return "event-name";
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
