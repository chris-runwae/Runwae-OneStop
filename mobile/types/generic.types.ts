export interface SavedItem {
  source_type: string;
  title: string;
  description?: string | undefined | null;
  location?: string | undefined | null;
  cover_image?: string | undefined | null;
  id: string;
}
