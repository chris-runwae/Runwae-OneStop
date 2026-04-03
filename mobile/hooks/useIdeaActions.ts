import { supabase } from '@/utils/supabase/client';
import { ItemType } from './useItineraryActions';
 
export interface SavedItineraryItem {
  id: string;
  trip_id: string;
  name: string;
  type: ItemType;
  location: string | null;
  external_id: string | null;
  image_url: string | null;
  notes: string | null;
  user_id: string;
  created_at: string;
}
 
export type CreateSavedItemInput = {
  name: string;
  type: ItemType;
  location?: string | null;
  external_id?: string | null;
  image_url?: string | null;
  notes?: string | null;
};
 
/**
 * Fetches all saved itinerary items (Ideas) for a given group.
 */
export const fetchSavedItems = async (
  tripId: string
): Promise<SavedItineraryItem[]> => {
  const { data, error } = await supabase
    .from('saved_itinerary_items')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });
 
  if (error) throw error;
  return (data || []) as SavedItineraryItem[];
};
 
/**
 * Saves a new activity/place as an Idea for the group.
 */
export const createSavedItem = async (
  tripId: string,
  userId: string,
  input: CreateSavedItemInput
): Promise<SavedItineraryItem> => {
  const { data, error } = await supabase
    .from('saved_itinerary_items')
    .insert({
      trip_id: tripId,
      user_id: userId,
      ...input,
    })
    .select('*')
    .single();
 
  if (error) throw error;
  return data as SavedItineraryItem;
};
 
/**
 * Deletes a saved idea.
 */
export const deleteSavedItem = async (itemId: string): Promise<void> => {
  const { error } = await supabase
    .from('saved_itinerary_items')
    .delete()
    .eq('id', itemId);
 
  if (error) throw error;
};
