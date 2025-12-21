import { create } from 'zustand';

export interface Destination {
  destinationId: number;
  name: string;
  type: string;
  parentDestinationId: number;
  lookupId: string;
  destinationUrl: string;
  defaultCurrencyCode: string;
  timeZone: string;
  iataCodes: [];
  countryCallingCode: string;
  languages: [];
  center: {
    latitude: number;
    longitude: number;
  };
}

export interface Tag {
  tagId: number;
  allNamesByLocale: {
    [key: string]: string;
  };
}

interface ViatorState {
  destinations: Destination[];
  setDestinations: (destinations: Destination[]) => void;
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
}

export const useViatorStore = create<ViatorState>((set) => ({
  destinations: [],
  setDestinations: (destinations: Destination[]) => set({ destinations }),
  tags: [],
  setTags: (tags: Tag[]) => set({ tags }),
}));
