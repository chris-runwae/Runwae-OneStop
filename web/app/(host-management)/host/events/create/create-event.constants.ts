export const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "draft", label: "Draft" },
] as const;

export const EVENT_CATEGORIES = [
  { value: "conference", label: "Conference" },
  { value: "workshop", label: "Workshop" },
  { value: "meetup", label: "Meetup" },
  { value: "other", label: "Other" },
] as const;

export const BOOKINGS_OPTIONS = [
  { value: "enable", label: "Enable bookings" },
  { value: "disable", label: "Disable bookings" },
] as const;

export const EVENT_THEMES = [
  { id: "1", name: "Theme 1" },
  { id: "2", name: "Theme 2" },
  { id: "3", name: "Theme 3" },
  { id: "4", name: "Theme 4" },
] as const;

export const EVENT_LINK_BASE = "runwae.io/events";

export function eventSlugFromName(name: string): string {
  if (!name.trim()) return "event-name";
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
