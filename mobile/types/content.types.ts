// ─── Shared ────────────────────────────────────────────────────────────────

export interface Review {
  id?: string;
  name: string;
  username: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

// ─── Destination ────────────────────────────────────────────────────────────

export interface Destination {
  id: string;
  title: string;
  location: string;
  image: string;
  country?: string | null;
  rating?: number;
  reviewCount?: number;
  description?: string;
  featured?: boolean;
  tags?: string[] | null;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Experience / Add-On ────────────────────────────────────────────────────

export interface ExperienceIncluded {
  title: string;
  icon?: string;
  subtitle?: string;
}

export interface ExperienceKnow {
  icon: string;
  title: string;
  description: string;
}

export interface ExperienceItineraryStep {
  image: string;
  title: string;
  description: string;
}

export interface Experience {
  id: string;
  title: string;
  category: string;
  rating: number;
  reviewCount: number;
  description: string;
  image: string;
  gallery: string[];
  price: number;
  featured?: boolean;
  destinationId?: string;
  included: ExperienceIncluded[];
  whatToKnow: ExperienceKnow[];
  itinerary: ExperienceItineraryStep[];
  reviews: Review[];
  location?: string;
  locationLat?: number;
  locationLng?: number;
  durationMinutes?: number;
  cost?: number;
  currency?: string;
  bookingReference?: string;
  cols?: any;
}

// ─── Event ──────────────────────────────────────────────────────────────────

export interface EventItineraryStep {
  day?: number;
  time?: string;
  title: string;
  description?: string;
}

export interface Event {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  category: string;
  image: string;
  latitude: number;
  longitude: number;
  description?: string;
  // Rich detail fields
  price?: number;
  currency?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  imageUrls?: string[];
  highlights?: string[];
  whatsIncluded?: string[];
  requirements?: string[];
  difficultyLevel?: string;
  itinerary?: EventItineraryStep[];
  status?: string;
  isFeatured?: boolean;
  featuredOrder?: number;
  publishedAt?: string;
}

// ─── Itinerary Template (home-screen suggested packages) ────────────────────

export interface ItineraryTemplateIncluded {
  icon: string;
  title: string;
  subtitle: string;
}

export interface ItineraryTemplateActivity {
  title: string;
  description: string;
}

export interface ItineraryTemplateDay {
  day: number;
  activities: ItineraryTemplateActivity[];
}

export interface ItineraryTemplate {
  id: string;
  title: string;
  location: string;
  duration: string;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  activities: number;
  description?: string;
  featured?: boolean;
  included: ItineraryTemplateIncluded[];
  dailyItinerary: ItineraryTemplateDay[];
  locationLat?: number;
  locationLng?: number;
  durationMinutes?: number;
  cost?: number;
  currency?: string;
  bookingReference?: string;
  cols?: any;
}
