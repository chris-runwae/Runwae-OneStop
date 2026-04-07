// Hotel booking feature types

export interface HotelSummary {
  hotelId: string;
  name: string;
  rating: number;
  address: string;
  thumbnail: string;
  minRate: number;
  currency: string;
  offerId: string;
  amenities?: string[];
}

export interface HotelDetail extends HotelSummary {
  gallery: string[];
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  city: string;
  country: string;
  rooms: Array<{
    id: number;
    roomName: string;
    photos: Array<{ url: string }>;
  }>;
  policies?: Array<{ name: string; description: string }>;
  sentimentPros?: string[];
  sentimentCons?: string[];
}

export interface HotelRate {
  offerId: string;
  roomName: string;
  boardName: string;
  price: number;
  currency: string;
  refundable: boolean;
  cancelDeadline?: string;
}

export interface HotelCitySection {
  city: string;
  hotels: HotelSummary[];
}

export interface HotelBookingPayload {
  tripId: string | null;
  userId: string;
  vendorId?: string | null;
  hotelId: string;
  hotelName: string;
  bookingRef: string;
  confirmationCode?: string | null;
  prebookId: string;
  transactionId?: string | null;
  checkin: string;
  checkout: string;
  guests: number;
  roomCount: number;
  currency: string;
  totalAmount: number;
  commissionAmount?: number | null;
  bookingType: 'individual' | 'group';
  rawResponse?: object | null;
}

export interface HotelBookingRecord extends HotelBookingPayload {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}
