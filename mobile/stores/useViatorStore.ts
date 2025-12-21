import AsyncStorage from '@react-native-async-storage/async-storage';
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

interface ViatorState {
  destinations: Destination[];
  setDestinations: (destinations: Destination[]) => void;
  getDestinations: () => Promise<Destination[]>;
  getDestinationById: (id: number) => Promise<Destination | null>;
  // getDestinationByLookupId: (lookupId: string) => Promise<Destination | null>;
  // getDestinationByIataCode: (iataCode: string) => Promise<Destination | null>;
  // getDestinationByCountryCallingCode: (countryCallingCode: string) => Promise<Destination | null>;
  // getDestinationByLanguage: (language: string) => Promise<Destination | null>;
  // getDestinationByCenter: (center: { latitude: number, longitude: number }) => Promise<Destination | null>;
}

export const useViatorStore = create<ViatorState>((set) => ({
  destinations: [],
  setDestinations: (destinations: Destination[]) => set({ destinations }),
  getDestinations: async () => {
    const destinations = await AsyncStorage.getItem('destinations');
    return destinations ? JSON.parse(destinations) : [];
  },
  getDestinationById: async (id: number) => {
    const destinations = await AsyncStorage.getItem('destinations');
    return destinations
      ? JSON.parse(destinations).find(
          (destination: Destination) => destination.destinationId === id
        )
      : null;
  },
}));
