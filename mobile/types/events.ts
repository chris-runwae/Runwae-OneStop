// types/events.ts

export interface Event {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  start_date: string;
  end_date: string;
  category: EventCategory;
  organizer_id: string;
  organizer_name?: string;
  image_url?: string;
  max_attendees?: number;
  current_attendees?: number;
  price?: number;
  is_published: boolean;
  event_itinerary?: EventItineraryItem[];
}

export type EventCategory = 
  | 'concert'
  | 'festival'
  | 'conference'
  | 'sports'
  | 'food'
  | 'art'
  | 'outdoor'
  | 'nightlife'
  | 'wellness'
  | 'other'
  | null;

export interface EventItineraryItem {
  id: string;
  time: string;
  title: string;
  description?: string;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  attendance_status: AttendanceStatus;
  created_at: string;
  updated_at: string;
}

export type AttendanceStatus = 'going' | 'interested' | 'cancelled';

export interface EventFilters {
  location?: string;
  startDate?: string;
  endDate?: string;
  category?: EventCategory;
  searchQuery?: string;
}

export interface EventWithAttendance extends Event {
  user_attendance?: EventAttendee;
  is_attending: boolean;
}