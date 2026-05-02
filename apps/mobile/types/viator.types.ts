/** Subset of Viator Partner API product/search response used in the app */

export interface ViatorImageVariant {
  height: number;
  width: number;
  url: string;
}

export interface ViatorProductImage {
  imageSource?: string;
  caption?: string;
  isCover?: boolean;
  variants: ViatorImageVariant[];
}

export interface ViatorProductReviews {
  totalReviews?: number;
  combinedAverageRating?: number;
}

export interface ViatorProductDuration {
  fixedDurationInMinutes?: number;
  variableDurationFromMinutes?: number;
  variableDurationToMinutes?: number;
}

export interface ViatorProductPricing {
  summary?: { fromPrice?: number };
  currency?: string;
}

export interface ViatorProductDestination {
  ref?: string;
  primary?: boolean;
}

export interface ViatorProduct {
  productCode: string;
  title: string;
  description?: string;
  images?: ViatorProductImage[];
  reviews?: ViatorProductReviews;
  duration?: ViatorProductDuration;
  itineraryType?: string;
  pricing?: ViatorProductPricing;
  productUrl?: string;
  destinations?: ViatorProductDestination[];
  flags?: string[];
}
