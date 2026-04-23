import { fetch } from 'expo/fetch';

import type {
  LiteAPIBookRequest,
  LiteAPIBookResponse,
  LiteAPIError,
  LiteAPIHotelDetailsResponse,
  LiteAPIPlacesResponse,
  LiteAPIPrebookRequest,
  LiteAPIPrebookResponse,
  LiteAPIRatesResponse,
  LiteAPISearchRatesRequest,
  LiteAPIHotelRateItem,
  LiteAPIHotelRatesResponse,
} from '@/types/liteapi.types';
import type { HotelSummary } from '@/types/hotel.types';
import { supabase } from './client';

/**
 * Search for places (destinations) using LiteAPI
 */
export async function searchPlaces(
  textQuery: string
): Promise<LiteAPIPlacesResponse> {
  try {
    const textQueryEncoded = encodeURIComponent(textQuery);
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-Key': 'sand_283f1436-ff62-4562-8f64-cdefc5605d29',
      },
    };
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_LITE_API_URL}/data/places?textQuery=${textQueryEncoded}`,
      options
    );
    const data = await response.json();
    if ((data as LiteAPIError).error) {
      throw new Error((data as LiteAPIError).error.message);
    }

    return data as LiteAPIPlacesResponse;
  } catch (error) {
    console.log('error: ', error);
    const errorMessage = (error as any).error?.message || (error as Error).message || 'Failed to search places';
    throw new Error(errorMessage);
  }
}

/**
 * Search for hotel rates using LiteAPI
 */
export async function searchRates(
  request: LiteAPISearchRatesRequest
): Promise<LiteAPIRatesResponse> {
  const requestBody = { ...request, roomMapping: true };
  try {
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'X-API-Key': 'sand_283f1436-ff62-4562-8f64-cdefc5605d29',
      },
      body: JSON.stringify(requestBody),
      timeout: 6,
    };

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_LITE_API_URL}/hotels/rates`,
      options
    );

    const data = await response.json();
    if ((data as LiteAPIError).error) {
      const err = (data as LiteAPIError).error;
      if (err.code !== 2001) {
        console.log('error getting rates: ', data);
      }
      throw new Error(err.message);
    }

    return data as LiteAPIRatesResponse;
  } catch (error) {
    console.log('error: ', error);
    const errorMessage = (error as any).error?.message || (error as Error).message || 'Failed to search rates';
    throw new Error(errorMessage);
  }
}

/**
 * Prebook a hotel offer
 */
export async function prebookOffer(
  request: LiteAPIPrebookRequest
): Promise<LiteAPIPrebookResponse> {
  try {
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'X-API-Key': 'sand_283f1436-ff62-4562-8f64-cdefc5605d29',
      },
      body: JSON.stringify(request),
    };
    // console.log('prebook request: ', request);

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_LITE_API_URL}/rates/prebook`,
      options
    );
    const data = await response.json();
    if ((data as LiteAPIError).error) {
      throw new Error((data as LiteAPIError).error.message);
    }

    return data as LiteAPIPrebookResponse;
  } catch (error) {
    console.log('error: ', error);
    const errorMessage = (error as any).error?.message || (error as Error).message || 'Failed to prebook offer';
    throw new Error(errorMessage);
  }
}

/**
 * Book a hotel after payment
 */
export async function bookHotel(
  request: LiteAPIBookRequest
): Promise<LiteAPIBookResponse> {
  try {
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'X-API-Key': 'sand_283f1436-ff62-4562-8f64-cdefc5605d29',
      },
      body: JSON.stringify(request),
    };

    console.log('[LiteAPI] Booking request:', JSON.stringify(request, null, 2));
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_LITE_API_URL}/rates/book`,
      options
    );
    const data = await response.json();
    console.log('[LiteAPI] Booking response data:', JSON.stringify(data, null, 2));

    if ((data as LiteAPIError).error) {
      throw new Error((data as LiteAPIError).error.message);
    }

    return data as LiteAPIBookResponse;
  } catch (error) {
    console.log('error: ', error);
    const errorMessage = (error as any).error?.message || (error as Error).message || 'Failed to book hotel';
    throw new Error(errorMessage);
  }
}

/**
 * Search hotels by city name for a given date range.
 * Step 1: resolve city → placeId via searchPlaces
 * Step 2: searchRates with that placeId, returns HotelSummary[]
 */
export async function searchHotelsByCity(
  cityName: string | null,
  checkin: string,
  checkout: string,
  adults: number,
  destinationPlaceId: string | null
): Promise<HotelSummary[]> {
  //Skip if placeId is provided
  // Resolve city to a LiteAPI placeId
  const placesResponse = await searchPlaces(
    cityName || destinationPlaceId || ''
  );
  const place = placesResponse.data?.[0];
  if (!place || !destinationPlaceId) return [];

  const ratesResponse = await searchRates({
    placeId: place.placeId || destinationPlaceId,
    checkin,
    checkout,
    occupancies: [{ adults }],
    currency: 'USD',
    guestNationality: 'US',
    maxRatesPerHotel: 5,
    includeHotelData: true,
  });

  const hotels = ratesResponse.hotels ?? [];
  const ratesMap = new Map(ratesResponse.data.map((h) => [h.hotelId, h]));

  return hotels.map((hotel): HotelSummary => {
    const hotelRates = ratesMap.get(hotel.id);
    const firstRate = hotelRates?.roomTypes?.[0]?.rates?.[0];
    const minRate = firstRate?.retailRate?.total?.[0]?.amount ?? 0;
    const currency = firstRate?.retailRate?.total?.[0]?.currency ?? 'USD';
    const offerId = firstRate?.offerId ?? '';

    return {
      hotelId: hotel.id,
      name: hotel.name,
      rating: hotel.rating ?? 0,
      address: hotel.address ?? '',
      thumbnail: hotel.main_photo ?? '',
      minRate,
      currency,
      offerId,
      amenities: hotel.tags ?? [],
    };
  });
}

export async function searchHotelsByCityOrPlaceId(
  cityName: string | null,
  checkin: string,
  checkout: string,
  adults: number,
  destinationPlaceId: string | null
): Promise<LiteAPIHotelRateItem[]> {
  //Skip if placeId is provided
  // Resolve city to a LiteAPI placeId
  const placesResponse = await searchPlaces(
    destinationPlaceId || (cityName ? cityName : '')
  );

  const place = placesResponse.data?.[0] ?? null;
  if (!place && !destinationPlaceId) return [];

  const ratesResponse = await searchRates({
    placeId: place?.placeId ?? destinationPlaceId ?? '',
    checkin,
    checkout,
    occupancies: [{ adults }],
    currency: 'USD',
    guestNationality: 'US',
    maxRatesPerHotel: 5,
    includeHotelData: true,
  });

  const hotels = ratesResponse.hotels ?? [];
  const hotelMetaMap = new Map(hotels.map((h) => [h.id, h]));
  const hotelWithRates = ratesResponse.data.map((h) => ({
    ...hotelMetaMap.get(h.hotelId),
    ...h,
  }));

  return hotelWithRates as unknown as LiteAPIHotelRateItem[];
}

/**
 * Get hotel details
 */
export async function getHotelDetails(
  hotelId: string
): Promise<LiteAPIHotelDetailsResponse> {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_LITE_API_URL}/data/hotel?hotelId=${hotelId}`,
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'X-API-Key': 'sand_283f1436-ff62-4562-8f64-cdefc5605d29',
        },
      }
    );
    const data = await response.json();
    if ((data as LiteAPIError).error) {
      throw new Error((data as LiteAPIError).error.message);
    }

    return data as LiteAPIHotelDetailsResponse;
  } catch (error) {
    console.log('error: ', error);
    const errorMessage = (error as any).error?.message || (error as Error).message || 'Failed to get hotel details';
    throw new Error(errorMessage);
  }
}

export async function getHotelRatesByHotelIds(
  hotelIds: string[],
  checkin: string,
  checkout: string,
  adults: number
): Promise<LiteAPIHotelRatesResponse> {
  try {
    const requestBody = {
      hotelIds,
      checkin,
      checkout,
      occupancies: [{ adults }],
      currency: 'USD',
      guestNationality: 'US',
      maxRatesPerHotel: 5,
      includeHotelData: true,
      roomMapping: true,
    };

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'X-API-Key': 'sand_283f1436-ff62-4562-8f64-cdefc5605d29',
      },
      body: JSON.stringify(requestBody),
    };

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_LITE_API_URL}/hotels/rates`,
      options
    );

    const data = await response.json();
    if ((data as LiteAPIError).error) {
      const err = (data as LiteAPIError).error;
      if (err.code !== 2001) {
        console.log('error getting rates: ', data);
      }
      throw new Error(err.message);
    }

    return data as LiteAPIHotelRatesResponse;
  } catch (error) {
    console.log('error: ', error);
    const errorMessage = (error as any).error?.message || (error as Error).message || 'Failed to search rates';
    throw new Error(errorMessage);
  }
}
