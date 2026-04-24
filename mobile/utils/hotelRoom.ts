import type { HotelRoomDetail } from '@/types/hotel.types';

/** Keys LiteAPI / providers may use for room-level amenities (camelCase + snake_case). */
const AMENITY_SOURCE_KEYS: string[] = [
  'amenities',
  'roomAmenities',
  'room_amenities',
  'facilities',
  'roomFacilities',
  'room_facilities',
];

const BED_TYPE_SOURCE_KEYS: string[] = [
  'bedTypes',
  'bed_types',
  'bedType',
  'bedding',
  'beds',
];

function asStringArray(v: unknown): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) {
    return v
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object') {
          const o = item as Record<string, unknown>;
          if (typeof o.name === 'string') return o.name.trim();
          if (typeof o.label === 'string') return o.label.trim();
          if (typeof o.amenity === 'string') return o.amenity.trim();
          if (typeof o.facility === 'string') return o.facility.trim();
          if (typeof o.description === 'string') return o.description.trim();
          if (typeof o.bedType === 'string') return o.bedType.trim();
        }
        return '';
      })
      .filter(Boolean);
  }
  if (typeof v === 'string') return v.trim() ? [v.trim()] : [];
  return [];
}

function collectFromKeys(
  room: Record<string, unknown>,
  keys: readonly string[]
): string[] {
  const out: string[] = [];
  for (const key of keys) {
    if (key in room && room[key] != null) {
      out.push(...asStringArray(room[key]));
    }
  }
  return [...new Set(out)];
}

function pickString(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

function pickNumber(v: unknown): number | undefined {
  if (v == null) return undefined;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function pickSize(v: unknown): number | string | undefined {
  if (v == null) return undefined;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim()) return v.trim();
  return undefined;
}

/**
 * Maps a raw room object from `/data/hotel` into `HotelRoomDetail`, merging
 * common provider field names so UI can rely on `amenities` and `bedTypes`.
 */
export function normalizeHotelRoom(
  room: Record<string, unknown>
): HotelRoomDetail | null {
  const idRaw = room.id;
  const id =
    typeof idRaw === 'number'
      ? idRaw
      : typeof idRaw === 'string'
        ? Number(idRaw)
        : NaN;
  if (Number.isNaN(id)) return null;

  const roomName = String(
    room.roomName ?? room.room_name ?? room.name ?? ''
  ).trim();

  const photos = Array.isArray(room.photos)
    ? (room.photos as { url: string }[])
    : [];

  const amenities = collectFromKeys(room, AMENITY_SOURCE_KEYS);
  const bedTypes = collectFromKeys(room, BED_TYPE_SOURCE_KEYS);

  return {
    id,
    roomName,
    photos,
    description: pickString(
      room.description ?? room.room_description ?? room.roomDescription
    ),
    maxAdults: pickNumber(room.maxAdults ?? room.max_adults),
    maxChildren: pickNumber(room.maxChildren ?? room.max_children),
    maxOccupancy: pickNumber(room.maxOccupancy ?? room.max_occupancy),
    roomSquareSize: pickSize(
      room.roomSquareSize ?? room.room_square_size ?? room.size ?? room.area
    ),
    amenities,
    bedTypes,
  };
}

export function normalizeHotelRooms(
  rooms: unknown[] | undefined | null
): HotelRoomDetail[] {
  if (!rooms?.length) return [];
  return rooms
    .map((r) =>
      normalizeHotelRoom(r as Record<string, unknown>)
    )
    .filter((r): r is HotelRoomDetail => r != null);
}
