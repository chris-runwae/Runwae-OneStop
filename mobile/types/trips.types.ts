export type TripStatus = "upcoming" | "ongoing" | "completed" | "cancelled";
export type TripVisibility = "private" | "public";
export type CollaboratorRole = "owner" | "editor" | "viewer";
export type CollaboratorStatus = "pending" | "accepted" | "declined";
export type TravelerRole = "organizer" | "traveler" | "guest";
export type TravelerStatus = "invited" | "confirmed" | "declined";
export type ItinerarySourceType =
  | "user_created"
  | "destination"
  | "event"
  | "activity"
  | "accommodation";
export type ItineraryDeletePermission =
  | "creator_only"
  | "all_collaborators"
  | "owner_only";

export type EventCategory =
  | "adventure"
  | "leisure"
  | "business"
  | "romantic"
  | "family"
  | "other";

export type TripCategory =
  | "leisure"
  | "business"
  | "family"
  | "adventure"
  | "cultural"
  | "romantic"
  | "other";

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  destination: string;

  // Dates
  start_date?: string | null;
  end_date?: string | null;

  // Descriptive info
  description?: string | null;
  category?: EventCategory | null;

  // Budget
  estimated_budget?: number | null;
  actual_spent?: number | null;
  currency?: string;

  // Media
  cover_image_url?: string | null;
  image_urls?: string[] | null;

  // Notes
  notes?: string | null;

  // Status
  status?: TripStatus;
  visibility?: TripVisibility;

  // Saved items (could be a list of place IDs, product IDs, etc.)
  saved_items?: Record<string, any>[]; // safer than `any[]`

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface FeaturedTrip {
  id: string;
  title: string;
  destination: string;
  description?: string | null;
  category?: TripCategory | null;
  estimatedBudget?: number | null;
  currency?: string | null;
  coverImageUrl?: string | null;
  imageUrls?: string[] | null;
  startDate?: string | null; // ISO date string
  endDate?: string | null; // ISO date string
  status?: TripStatus;
  visibility?: TripVisibility;
  createdAt: string;
  updatedAt: string;
}

export type TripType = "featured" | "user";

export interface TripItinerary {
  id: string;
  tripId: string;
  tripType: TripType;
  sourceType?: string | null;
  sourceId?: string | null;
  date: string; // ISO date
  time?: string | null;
  title: string;
  description?: string | null;
  location?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  durationMinutes?: number | null;
  cost?: number | null;
  currency?: string;
  bookingReference?: string | null;
  notes?: string | null;
  orderIndex: number;
  isCompleted: boolean;
  completedAt?: string | null;
  createdBy?: string | null;
  canBeDeletedBy?: string | null;
  coverImageUrl?: string | null;
  imageUrls?: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripInput {
  user_id: string;
  title: string;
  destination: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  category?: EventCategory;
  estimated_budget?: number;
  currency?: string;
  cover_image_url?: string;
  image_urls?: string[];
  notes?: string;
  visibility?: TripVisibility;
}

export interface UpdateTripInput {
  title?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  category?: EventCategory;
  estimated_budget?: number;
  actual_spent?: number;
  currency?: string;
  cover_image_url?: string;
  image_urls?: string[];
  notes?: string;
  status?: TripStatus;
  visibility?: TripVisibility;
  saved_items?: any[];
}

export interface TripCollaborator {
  id: string;
  trip_id: string;
  user_id: string;
  role: CollaboratorRole;
  invited_by: string | null;
  invited_at: string;
  accepted_at: string | null;
  status: CollaboratorStatus;
}

export interface CreateCollaboratorInput {
  trip_id: string;
  user_id: string;
  role: CollaboratorRole;
  invited_by: string;
}

export interface TripItineraryItem {
  id: string;
  trip_id: string;
  source_type: ItinerarySourceType | null;
  source_id: string | null;
  date: string;
  time: string | null;
  title: string;
  description: string | null;
  location: string | null;
  location_lat: number | null;
  location_lng: number | null;
  duration_minutes: number | null;
  cost: number | null;
  currency: string;
  booking_reference: string | null;
  notes: string | null;
  order_index: number;
  is_completed: boolean;
  completed_at: string | null;
  created_by: string;
  can_be_deleted_by: ItineraryDeletePermission;
  created_at: string;
  updated_at: string;
}

export interface CreateItineraryItemInput {
  trip_id: string;
  source_type?: ItinerarySourceType;
  source_id?: string;
  date: string;
  time?: string;
  title: string;
  description?: string;
  location?: string;
  location_lat?: number;
  location_lng?: number;
  duration_minutes?: number;
  cost?: number;
  currency?: string;
  booking_reference?: string;
  notes?: string;
  order_index?: number;
  created_by: string;
  can_be_deleted_by?: ItineraryDeletePermission;
}

export interface UpdateItineraryItemInput {
  date?: string;
  time?: string;
  title?: string;
  description?: string;
  location?: string;
  location_lat?: number;
  location_lng?: number;
  duration_minutes?: number;
  cost?: number;
  currency?: string;
  booking_reference?: string;
  notes?: string;
  order_index?: number;
  is_completed?: boolean;
  can_be_deleted_by?: ItineraryDeletePermission;
}

export interface TripTraveler {
  id: string;
  trip_id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  role: TravelerRole;
  status: TravelerStatus;
  dietary_requirements: string | null;
  special_needs: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  created_at: string;
}

export interface CreateTravelerInput {
  trip_id: string;
  user_id?: string;
  name: string;
  email?: string;
  phone?: string;
  role?: TravelerRole;
  dietary_requirements?: string;
  special_needs?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

// Trip with relations
export interface TripWithDetails extends Trip {
  collaborators?: TripCollaborator[];
  itinerary?: TripItineraryItem[];
  travelers?: TripTraveler[];
}
