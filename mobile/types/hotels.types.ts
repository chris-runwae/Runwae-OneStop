export interface Hotel {
  id: string;
  name: string;

  hotelDescription?: string;
  hotelImportantInformation?: string;
  checkinCheckoutTimes?: object;
  hotelImages?: object;
  main_photo?: string;
  thumbnail?: string;
  country?: string;
  city?: string;
  starRating?: number;
  location?: object;
  address?: string;
  hotelFacilities?: object;
  zip?: string;
  chain?: string;
  facilities?: object;
  rooms?: object;
  phone?: string;
  fax?: string;
  email?: string;
  hotelType?: string;
  hotelTypeId?: number;
  airportCode?: string;
  rating?: number;
  reviewCount?: number;
  parking?: string;
  groupRoomMin?: number;
  childAllowed?: boolean;
  petsAllowed?: boolean;
  policies?: object;
  rohId?: number;
  sentiment_analysis?: object;
  sentiment_updated_at?: string;
  deletedAt?: object;
}
