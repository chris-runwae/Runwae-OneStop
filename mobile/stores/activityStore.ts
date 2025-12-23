// stores/activityStore.ts
import { create } from 'zustand';

export interface ViatorActivity {
  productCode: string;
  title: string;
  description: string;
  images: {
    imageSource: string;
    caption: string;
    isCover: boolean;
    variants: {
      height: number;
      width: number;
      url: string;
    }[];
  }[];
  reviews: {
    sources: {
      provider: string;
      totalCount: number;
      averageRating: number;
    }[];
    totalReviews: number;
    combinedAverageRating: number;
  };
  duration: {
    variableDurationFromMinutes: number;
    variableDurationToMinutes: number;
  };
  confirmationType: string;
  itineraryType: string;
  pricing: {
    summary: {
      fromPrice: number;
      fromPriceBeforeDiscount: number;
    };
    currency: string;
  };
  productUrl: string;
  destinations: {
    ref: string;
    primary: boolean;
  }[];
  tags: number[];
  flags: string[];
  translationInfo: {
    containsMachineTranslatedText: boolean;
    translationSource: string;
  };
}

interface ActivityStore {
  currentActivity: ViatorActivity | null;
  setCurrentActivity: (activity: ViatorActivity) => void;
  clearCurrentActivity: () => void;
}

export const useActivityStore = create<ActivityStore>((set) => ({
  currentActivity: null,
  setCurrentActivity: (activity) => set({ currentActivity: activity }),
  clearCurrentActivity: () => set({ currentActivity: null }),
}));
