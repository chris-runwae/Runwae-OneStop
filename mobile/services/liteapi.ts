import { supabase } from '@/lib/supabase';
import * as Expo from 'expo';
import { fetch } from 'expo/fetch';

import type {
  LiteAPIPlacesResponse,
  LiteAPIRatesResponse,
  LiteAPISearchRatesRequest,
  LiteAPIPrebookRequest,
  LiteAPIPrebookResponse,
  LiteAPIBookRequest,
  LiteAPIBookResponse,
  LiteAPIHotelDetailsResponse,
  LiteAPIError,
} from '@/types/liteapi.types';

/**
 * Search for places (destinations) using LiteAPI
 */
// export async function searchPlaces(
//   textQuery: string
// ): Promise<LiteAPIPlacesResponse> {
//   const { data, error } = await supabase.functions.invoke('liteapi', {
//     body: {
//       method: 'GET',
//       endpoint: 'places',
//       body: { textQuery },
//     },
//   });

//   if (error) {
//     throw new Error(error.message || 'Failed to search places');
//   }

//   if ((data as LiteAPIError).error) {
//     throw new Error((data as LiteAPIError).error.message);
//   }

//   return data as LiteAPIPlacesResponse;
// }
export async function searchPlaces(
  textQuery: string
): Promise<LiteAPIPlacesResponse> {
  try {
    console.log('searchPlaces: ', textQuery);
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-Key': 'sand_283f1436-ff62-4562-8f64-cdefc5605d29',
      },
    };
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_LITE_API_URL}/data/places?textQuery=${textQuery}`,
      options
    );
    const data = await response.json();

    if ((data as LiteAPIError).error) {
      throw new Error((data as LiteAPIError).error.message);
    }

    return data as LiteAPIPlacesResponse;
  } catch (error) {
    throw new Error((error as Error).message || 'Failed to search places');
  }
}

/**
 * Search for hotel rates using LiteAPI
 */
export async function searchRates(
  request: LiteAPISearchRatesRequest
): Promise<LiteAPIRatesResponse> {
  const { data, error } = await supabase.functions.invoke('liteapi', {
    body: {
      method: 'POST',
      endpoint: 'rates',
      body: request,
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to search rates');
  }

  if ((data as LiteAPIError).error) {
    throw new Error((data as LiteAPIError).error.message);
  }

  return data as LiteAPIRatesResponse;
}

/**
 * Prebook a hotel offer
 */
export async function prebookOffer(
  request: LiteAPIPrebookRequest
): Promise<LiteAPIPrebookResponse> {
  const { data, error } = await supabase.functions.invoke('liteapi', {
    body: {
      method: 'POST',
      endpoint: 'prebook',
      body: request,
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to prebook offer');
  }

  if ((data as LiteAPIError).error) {
    throw new Error((data as LiteAPIError).error.message);
  }

  return data as LiteAPIPrebookResponse;
}

/**
 * Book a hotel after payment
 */
export async function bookHotel(
  request: LiteAPIBookRequest
): Promise<LiteAPIBookResponse> {
  const { data, error } = await supabase.functions.invoke('liteapi', {
    body: {
      method: 'POST',
      endpoint: 'book',
      body: request,
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to book hotel');
  }

  if ((data as LiteAPIError).error) {
    throw new Error((data as LiteAPIError).error.message);
  }

  return data as LiteAPIBookResponse;
}

/**
 * Get hotel details
 */
export async function getHotelDetails(
  hotelId: string
): Promise<LiteAPIHotelDetailsResponse> {
  const { data, error } = await supabase.functions.invoke('liteapi', {
    body: {
      method: 'GET',
      endpoint: 'hotel',
      body: { hotelId },
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to get hotel details');
  }

  if ((data as LiteAPIError).error) {
    throw new Error((data as LiteAPIError).error.message);
  }

  return data as LiteAPIHotelDetailsResponse;
}
