import { ItinerarySourceType } from './trips.types';

export interface SavedItem {
  source_type: ItinerarySourceType;
  title: string;
  description?: string | undefined | null;
  location?: string | undefined | null;
  cover_image?: string | undefined | null;
  id: string;
}
