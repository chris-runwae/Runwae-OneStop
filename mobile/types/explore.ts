export type Destination = {
  id: string;
  name: string;
  city: string;
  country: string;
  slug: string;
  shortDescription: string;
  heroImage: string;
  thumbnailImage: string;
  tags: string[];
  isFeatured: boolean;
  popularityScore: number;
};

export type Experience = {
  id: string;
  destinationId: string;
  title: string;
  subtitle?: string;
  location: string;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  currency: string;
  durationMinutes: number;
  activityLevel: 'low' | 'medium' | 'high';
  heroImage: string;
  galleryImages: string[];
  categories: string[];
  tags: string[];
  description: string;
  isFeatured: boolean;
};

export type ItineraryItem = {
  experienceId: string;
  order: number;
  title: string;
  description: string;
  image?: string;
};

export type ExperienceInfoType =
  | 'guest_requirements'
  | 'what_to_bring'
  | 'dining'
  | 'entertainment'
  | 'cancellation_policy';

export type ExperienceInfo = {
  experienceId: string;
  type: ExperienceInfoType;
  content: string;
};

export type Review = {
  id: string;
  experienceId: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
};

export type FeaturedEvent = {
  id: string;
  title: string;
  location: string;
  category: string;
  startDate: string;
  endDate?: string;
  time?: string;
  heroImage: string;
};

export type ExploreData = {
  destinations: Destination[];
  experiences: Experience[];
  itineraries: ItineraryItem[];
  experienceInfo: ExperienceInfo[];
  reviews: Review[];
  featuredEvents: FeaturedEvent[];
};
