// LiteAPI Types for Hotel Booking Flow

export interface LiteAPIPlace {
  placeId: string;
  displayName: string;
  formattedAddress: string;
}

export interface LiteAPIPlacesResponse {
  data: LiteAPIPlace[];
}

export interface LiteAPIOccupancy {
  adults: number;
  children?: number;
}

export interface LiteAPIRate {
  name: string;
  mappedRoomId: number;
  boardName: string;
  offerId: string;
  retailRate: {
    total: Array<{ amount: number; currency: string }>;
    taxesAndFees?: Array<{ included: boolean; amount?: number }>;
  };
  cancellationPolicies: {
    refundableTag: 'RFN' | 'NRFN';
    cancelPolicyInfos?: Array<{ cancelTime: string }>;
  };
}

export interface LiteAPIRoomType {
  offerId: string;
  rates: LiteAPIRate[];
}

export interface LiteAPIHotelRate {
  hotelId: string;
  roomTypes: LiteAPIRoomType[];
}

export interface LiteAPIAIHotel {
  id: string;
  name: string;
  main_photo: string;
  address: string;
  rating: number;
  tags?: string[];
  persona?: string;
  style?: string;
  location_type?: string;
  story?: string;
}

export interface LiteAPIRatesResponse {
  data: LiteAPIHotelRate[];
  hotels?: LiteAPIAIHotel[];
  guestLevel: number;
  sandbox: boolean;
}

export interface LiteAPIPrebookRequest {
  usePaymentSdk: boolean;
  offerId: string;
}

export interface LiteAPIPrebookResponse {
  data: {
    prebookId: string;
    offerId: string;
    hotelId: string;
    price: number;
    commission: number;
    currency: string;
    transactionId: string;
    secretKey: string;
    paymentTypes: string[];
    roomTypes: Array<{
      rates: Array<{
        rateId: string;
        retailRate: {
          total: Array<{ amount: number; currency: string }>;
          taxesAndFees?: Array<{ included: boolean; amount?: number }>;
        };
        cancellationPolicies: {
          refundableTag: 'RFN' | 'NRFN';
          cancelPolicyInfos?: Array<{ cancelTime: string }>;
        };
      }>;
    }>;
  };
}

export interface LiteAPIBookRequest {
  prebookId: string;
  holder: {
    firstName: string;
    lastName: string;
    email: string;
  };
  payment: {
    method: 'TRANSACTION_ID';
    transactionId: string;
  };
  guests: Array<{
    occupancyNumber: number;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

export interface LiteAPIBookResponse {
  data: {
    bookingId: string;
    status: string;
    hotelConfirmationCode: string;
    checkin: string;
    checkout: string;
    hotel: {
      hotelId: string;
      name: string;
    };
    price: number;
    currency: string;
    cancellationPolicies: {
      refundableTag: 'RFN' | 'NRFN';
      cancelPolicyInfos?: Array<{ cancelTime: string }>;
    };
  };
}

export interface LiteAPIHotelDetails {
  id: string;
  name: string;
  hotelDescription: string;
  hotelImportantInformation?: string;
  hotelImages: Array<{ url: string; defaultImage?: boolean }>;
  main_photo: string;
  videoUrl?: string;
  city: string;
  country: string;
  address: string;
  hotelFacilities: string[];
  starRating: number;
  location: {
    latitude: number;
    longitude: number;
  };
  rooms: Array<{
    id: number;
    roomName: string;
    photos: Array<{ url: string }>;
    description?: string;
    maxAdults?: number;
    maxChildren?: number;
    maxOccupancy?: number;
    roomSquareSize?: number | string;
    amenities?: string[];
    bedTypes?: string[];
  }>;
  policies?: Array<{ name: string; description: string }>;
  sentiment_analysis?: {
    pros: string[];
    cons: string[];
  };
}

export interface LiteAPIHotelDetailsResponse {
  data: LiteAPIHotelDetails;
}

export interface LiteAPISearchRatesRequest {
  occupancies: LiteAPIOccupancy[];
  currency: string;
  guestNationality: string;
  checkin: string;
  checkout: string;
  placeId?: string;
  hotelIds?: string[];
  aiSearch?: string;
  roomMapping?: boolean;
  maxRatesPerHotel?: number;
  includeHotelData?: boolean;
}

export interface LiteAPIError {
  error: {
    code: number;
    description: string;
    message: string;
  };
}

// Unified hotel+rates item (returned when includeHotelData: true)
export interface LiteAPIHotelRateItem {
  // Hotel metadata fields
  id: string;
  name: string;
  main_photo: string;
  thumbnail: string;
  address: string;
  rating: number;
  tags?: string[];

  // Rates fields
  hotelId: string;
  roomTypes: LiteAPIHotelRoomType[];
  et: number;
}

export interface LiteAPIHotelRoomType {
  roomTypeId: string;
  offerId: string;
  supplier: string;
  supplierId: number;
  rates: LiteAPIHotelRoomRate[];
  offerRetailRate: LiteAPIPriceAmount;
  suggestedSellingPrice: LiteAPIPriceAmount;
  offerInitialPrice: LiteAPIPriceAmount;
  priceType: string;
  rateType: string;
  paymentTypes: string[];
}

export interface LiteAPIHotelRoomRate {
  rateId: string;
  /** When present, aligns with `HotelDetail.rooms[].id` for gallery mapping. */
  mappedRoomId?: number;
  occupancyNumber: number;
  name: string;
  maxOccupancy: number;
  adultCount: number;
  childCount: number;
  childrenAges: number[];
  boardType: string;
  boardName: string;
  remarks: string;
  priceType: string;
  commission: LiteAPIPriceAmount[];
  retailRate: LiteAPIHotelRetailRate;
  cancellationPolicies: LiteAPIHotelCancellationPolicies;
  paymentTypes: string[];
  providerCommission: LiteAPIPriceAmount;
  perks: string[];
  promotions: null | unknown;
  offerId?: string;
}

export interface LiteAPIHotelRetailRate {
  total: LiteAPIPriceAmount[];
  suggestedSellingPrice: LiteAPIPriceAmount[];
  initialPrice: LiteAPIPriceAmount[];
  taxesAndFees: LiteAPITaxFee[];
}

export interface LiteAPITaxFee {
  included: boolean;
  description: string;
  amount: number;
  currency: string;
}

export interface LiteAPIHotelCancellationPolicies {
  cancelPolicyInfos: unknown[];
  hotelRemarks: unknown[];
  refundableTag: string;
}

export interface LiteAPIPriceAmount {
  amount: number;
  currency: string;
  source?: string;
}

// Top-level rates response (unified, when includeHotelData: true)
export interface LiteAPIHotelRatesResponse {
  sandbox?: boolean;
  hotels?: LiteAPIHotelRateItem[];
  data: LiteAPIHotelRateItem[];
  guestLevel?: number;
}
