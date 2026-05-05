// Editor-facing shapes — narrower than the schema (which stores `type` as
// free string). Mirrors the validators in
// packages/convex/convex/admin/itinerary_templates.ts.

export type ItemType = "activity" | "food" | "transport" | "lodging" | "free";

export interface TemplateItem {
  time?: string;
  endTime?: string;
  title: string;
  description?: string;
  type: ItemType;
  imageUrl?: string;
  locationName?: string;
  coords?: { lat: number; lng: number };
  estimatedCost?: number;
  currency?: string;
  externalUrl?: string;
}

export interface TemplateDay {
  dayNumber: number;
  title: string;
  items: TemplateItem[];
}

export const ITEM_TYPE_OPTIONS: Array<{ value: ItemType; label: string }> = [
  { value: "activity", label: "Activity" },
  { value: "food", label: "Food" },
  { value: "transport", label: "Transport" },
  { value: "lodging", label: "Lodging" },
  { value: "free", label: "Free time" },
];
