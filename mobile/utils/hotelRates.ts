import type { HotelDetail } from '@/types/hotel.types';
import type {
  LiteAPIHotelRatesResponse,
  LiteAPIHotelRoomRate,
  LiteAPIHotelRoomType,
} from '@/types/liteapi.types';

export function ratePriceParts(
  room: LiteAPIHotelRoomRate | Record<string, unknown>
): { amount: number; currency: string } | null {
  const r = room as LiteAPIHotelRoomRate & {
    suggestedSellingPrice?: { amount: number; currency: string };
  };
  const direct = r.suggestedSellingPrice;
  if (direct && typeof direct.amount === 'number') {
    return { amount: direct.amount, currency: direct.currency ?? 'USD' };
  }
  const fromRetail = r?.retailRate?.suggestedSellingPrice?.[0];
  if (fromRetail && typeof fromRetail.amount === 'number') {
    return {
      amount: fromRetail.amount,
      currency: fromRetail.currency ?? 'USD',
    };
  }
  const fromTotal = r?.retailRate?.total?.[0];
  if (fromTotal && typeof fromTotal.amount === 'number') {
    return { amount: fromTotal.amount, currency: fromTotal.currency ?? 'USD' };
  }
  return null;
}

export function findRateInRatesResponse(
  rates: LiteAPIHotelRatesResponse | null,
  hotelId: string,
  rateId: string
): { roomType: LiteAPIHotelRoomType; rate: LiteAPIHotelRoomRate } | null {
  const entry = rates?.data?.find((d) => d.hotelId === hotelId);
  if (!entry?.roomTypes) return null;
  for (const roomType of entry.roomTypes) {
    for (const rate of roomType.rates ?? []) {
      if (rate.rateId === rateId) {
        return { roomType, rate };
      }
    }
  }
  return null;
}

/** Prefer room-specific photos when API maps a rate to a hotel room id. */
export function roomGalleryForMappedRoom(
  hotel: HotelDetail,
  mappedRoomId?: number | null
): string[] {
  if (mappedRoomId == null || !hotel.rooms?.length) {
    return hotel.gallery.slice(0, 12);
  }
  const match = hotel.rooms.find((r) => r.id === mappedRoomId);
  const urls = match?.photos?.map((p) => p.url).filter(Boolean) ?? [];
  return urls.length > 0 ? urls : hotel.gallery.slice(0, 12);
}
