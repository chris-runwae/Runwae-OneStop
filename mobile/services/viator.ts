import Constants from 'expo-constants';

const BASE_URL = Constants?.expoConfig?.extra?.SUPABASE_FUNCTIONS_URL;

console.log("Supabase Function URL:", BASE_URL);

interface SearchFilters {
  destination?: string;
  tags?: number[];
  flags?: string[];
  lowestPrice?: number;
  highestPrice?: number;
  startDate?: string;
  endDate?: string;
  includeAutomaticTranslations?: boolean;
  confirmationType?: string;
  durationInMinutes?: { from: number; to: number };
  rating?: { from: number; to: number };
}

interface ViatorSearchParams {
  text?: string;
  filters?: SearchFilters;
}

export async function searchViator({ text, filters }: ViatorSearchParams) {
  // Default filtering values
  const defaultFilters: SearchFilters = {
    destination: "732",
    tags: [21972],
    flags: ["LIKELY_TO_SELL_OUT", "FREE_CANCELLATION"],
    lowestPrice: 5,
    highestPrice: 500,
    startDate: "2023-01-30",
    endDate: "2023-02-28",
    includeAutomaticTranslations: true,
    confirmationType: "INSTANT",
    durationInMinutes: { from: 20, to: 360 },
    rating: { from: 3, to: 5 },
  };

  const body = {
    endpoint: "products/search",
    method: "POST",
    body: {
      filtering: { ...defaultFilters, ...filters }, // allow overrides
    },
  };

  const res = await fetch(`https://${BASE_URL}/viator`, {
    method: "POST",
    headers: { "Content-Type": "application/json;version=2.0" },
    body: JSON.stringify(body),
  });

  console.log("Viator response:", await res?.json());

  if (!res.ok) {
    throw new Error(`Viator API error: ${res.status}`);
  }

  return res.json();
}
