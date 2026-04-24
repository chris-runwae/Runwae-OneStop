import { supabase } from '@/utils/supabase/client';

// ================================================================
// Types
// ================================================================

export type ItemType =
  | 'flight'
  | 'hotel'
  | 'activity'
  | 'restaurant'
  | 'transport'
  | 'cruise'
  | 'event'
  | 'other';

export type Itinerary = {
  id: string;
  group_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type ItineraryDay = {
  id: string;
  itinerary_id: string;
  day_number: number;
  date: string | null;
  title: string | null;
  notes: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type ItineraryItem = {
  id: string;
  day_id: string;
  title: string;
  type: ItemType;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  cost: number | null;
  currency: string;
  notes: string | null;
  image_url: string | null;
  external_id: string | null;
  position: number;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type ItineraryDayWithItems = ItineraryDay & {
  itinerary_items: ItineraryItem[];
};

export type CreateItineraryItemInput = {
  title: string;
  type: ItemType;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  cost?: number | null;
  currency?: string;
  notes?: string | null;
  image_url?: string | null;
  external_id?: string | null;
};

export type UpdateItineraryItemInput = Partial<CreateItineraryItemInput>;


// ================================================================
// Pure async functions — no React state here.
// State lives in TripsContext.
// ================================================================

/**
 * Fetches the itinerary for a group, creating one if it doesn't exist.
 * Enforces the one-itinerary-per-group invariant.
 */
export const fetchOrCreateItinerary = async (
  groupId: string,
  userId: string,
): Promise<Itinerary> => {
  const { data: existing, error: fetchErr } = await supabase
    .from('itineraries')
    .select('*')
    .eq('group_id', groupId)
    .maybeSingle();

  if (fetchErr) throw fetchErr;
  if (existing) return existing as Itinerary;

  const { data: created, error: createErr } = await supabase
    .from('itineraries')
    .insert({ group_id: groupId, created_by: userId })
    .select('*')
    .single();

  if (createErr) throw createErr;
  return created as Itinerary;
};

/**
 * Returns the total count of itinerary items for a given group.
 */
export const fetchItineraryItemsCount = async (groupId: string): Promise<number> => {
  const { data: itin, error: itinErr } = await supabase
    .from('itineraries')
    .select('id')
    .eq('group_id', groupId)
    .maybeSingle();

  if (itinErr || !itin) return 0;

  const { data, error } = await supabase
    .from('itinerary_day')
    .select('itinerary_items(id)')
    .eq('itinerary_id', itin.id);

  if (error) return 0;

  const totalCount = (data as any[]).reduce(
    (acc, day) => acc + (day.itinerary_items?.length || 0),
    0
  );

  return totalCount;
};

/**
 * Returns all days for an itinerary with their nested items,
 * ordered by day_number and position.
 */
export const fetchDaysWithItems = async (
  itineraryId: string,
): Promise<ItineraryDayWithItems[]> => {
  const { data, error } = await supabase
    .from('itinerary_day')
    .select('*, itinerary_items(*)')
    .eq('itinerary_id', itineraryId)
    .order('day_number', { ascending: true });

  if (error) throw error;

  // Sort items by position within each day.
  return (data as ItineraryDayWithItems[]).map((day) => ({
    ...day,
    itinerary_items: [...(day.itinerary_items ?? [])].sort(
      (a, b) => a.position - b.position,
    ),
  }));
};

/**
 * Appends a new day to the itinerary.
 * day_number and position are set to max + 1 automatically.
 */
export const createDay = async (
  itineraryId: string,
  input: { title?: string; date?: string },
): Promise<ItineraryDay> => {
  // Get current max day_number.
  const { data: existing, error: fetchErr } = await supabase
    .from('itinerary_day')
    .select('day_number')
    .eq('itinerary_id', itineraryId)
    .order('day_number', { ascending: false })
    .limit(1);

  if (fetchErr) throw fetchErr;

  const nextNumber = existing && existing.length > 0
    ? (existing[0].day_number as number) + 1
    : 1;

  const { data, error } = await supabase
    .from('itinerary_day')
    .insert({
      itinerary_id: itineraryId,
      day_number: nextNumber,
      position: nextNumber,
      title: input.title ?? null,
      date: input.date ?? null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as ItineraryDay;
};

/** Patches a day's mutable fields. */
export const updateDay = async (
  dayId: string,
  input: Partial<Pick<ItineraryDay, 'title' | 'date' | 'notes' | 'position' | 'day_number'>>,
): Promise<ItineraryDay> => {
  const { data, error } = await supabase
    .from('itinerary_day')
    .update(input)
    .eq('id', dayId)
    .select('*')
    .single();

  if (error) throw error;
  return data as ItineraryDay;
};

/**
 * Deletes a day (and its items via CASCADE).
 * App-layer guard: confirm with user before calling if items > 0.
 */
export const deleteDay = async (dayId: string): Promise<void> => {
  const { error } = await supabase
    .from('itinerary_day')
    .delete()
    .eq('id', dayId);

  if (error) throw error;
};

/**
 * Appends a new item to a day.
 * position is set to max + 1 automatically.
 */
export const createItem = async (
  dayId: string,
  input: CreateItineraryItemInput,
  userId: string,
): Promise<ItineraryItem> => {
  const { data: existing, error: fetchErr } = await supabase
    .from('itinerary_items')
    .select('position')
    .eq('day_id', dayId)
    .order('position', { ascending: false })
    .limit(1);

  if (fetchErr) throw fetchErr;

  const nextPosition = existing && existing.length > 0
    ? (existing[0].position as number) + 1
    : 0;

  const { data, error } = await supabase
    .from('itinerary_items')
    .insert({
      day_id: dayId,
      created_by: userId,
      position: nextPosition,
      currency: input.currency ?? 'GBP',
      ...input,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as ItineraryItem;
};

/** Patches an item's mutable fields. */
export const updateItem = async (
  itemId: string,
  input: UpdateItineraryItemInput,
): Promise<ItineraryItem> => {
  const { data, error } = await supabase
    .from('itinerary_items')
    .update(input)
    .eq('id', itemId)
    .select('*')
    .single();

  if (error) throw error;
  return data as ItineraryItem;
};

/** Deletes an item. */
export const deleteItem = async (itemId: string): Promise<void> => {
  const { error } = await supabase
    .from('itinerary_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
};

/**
 * Reorders items within a day.
 * orderedIds is the full ordered array of item IDs for that day.
 * Updates position = index for each item in parallel.
 */
export const reorderItems = async (
  _dayId: string,
  orderedIds: string[],
): Promise<void> => {
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from('itinerary_items')
        .update({ position: index })
        .eq('id', id),
    ),
  );
};

/**
 * Moves an item to a different day and updates its position.
 */
export const moveItemToDay = async (
  itemId: string,
  targetDayId: string,
  newPosition: number = 0
): Promise<void> => {
  const { error } = await supabase
    .from('itinerary_items')
    .update({ day_id: targetDayId, position: newPosition })
    .eq('id', itemId);

  if (error) throw error;
};

/**
 * Reorders days within an itinerary.
 * orderedIds is the full ordered array of day IDs.
 * Updates both position and day_number = index + 1.
 */
export const reorderDays = async (
  _itineraryId: string,
  orderedIds: string[],
): Promise<void> => {
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from('itinerary_day')
        .update({ position: index, day_number: index + 1 })
        .eq('id', id),
    ),
  );
};
