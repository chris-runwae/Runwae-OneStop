import { v } from "convex/values";
import { action } from "./_generated/server";

// Open-Meteo — no key, no signup. Daily forecast + historical + air quality.
// We use the daily endpoint and pluck out tmin/tmax/precip/weather_code so
// the trip itinerary can render a small weather chip per day.
//
// Codes: https://open-meteo.com/en/docs#api-documentation (WMO weather codes)
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const HISTORICAL_URL = "https://archive-api.open-meteo.com/v1/archive";

const CODE_LABEL: Record<number, { label: string; emoji: string }> = {
  0: { label: "Clear", emoji: "☀️" },
  1: { label: "Mostly clear", emoji: "🌤" },
  2: { label: "Partly cloudy", emoji: "⛅" },
  3: { label: "Overcast", emoji: "☁️" },
  45: { label: "Fog", emoji: "🌫" },
  48: { label: "Rime fog", emoji: "🌫" },
  51: { label: "Light drizzle", emoji: "🌦" },
  53: { label: "Drizzle", emoji: "🌦" },
  55: { label: "Heavy drizzle", emoji: "🌧" },
  61: { label: "Light rain", emoji: "🌧" },
  63: { label: "Rain", emoji: "🌧" },
  65: { label: "Heavy rain", emoji: "⛈" },
  71: { label: "Light snow", emoji: "🌨" },
  73: { label: "Snow", emoji: "❄️" },
  75: { label: "Heavy snow", emoji: "❄️" },
  77: { label: "Snow grains", emoji: "❄️" },
  80: { label: "Showers", emoji: "🌦" },
  81: { label: "Heavy showers", emoji: "🌧" },
  82: { label: "Violent showers", emoji: "⛈" },
  95: { label: "Thunderstorm", emoji: "⛈" },
  96: { label: "Thunderstorm + hail", emoji: "⛈" },
  99: { label: "Severe thunderstorm", emoji: "⛈" },
};

export type DayWeather = {
  date: string;
  tempMaxC: number | null;
  tempMinC: number | null;
  precipMm: number | null;
  code: number | null;
  label: string;
  emoji: string;
};

// Open-Meteo's forecast endpoint covers ~16 days ahead. For dates further out
// or in the past, fall back to the historical archive.
function pickHostFor(dateIso: string): string {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const ms = Date.parse(dateIso);
  if (!Number.isFinite(ms)) return FORECAST_URL;
  const days = (ms - today.getTime()) / (24 * 60 * 60 * 1000);
  if (days < -1) return HISTORICAL_URL;
  return FORECAST_URL;
}

export const getDailyForecast = action({
  args: {
    lat: v.number(),
    lng: v.number(),
    dates: v.array(v.string()), // YYYY-MM-DD list
  },
  handler: async (_ctx, { lat, lng, dates }): Promise<DayWeather[]> => {
    if (dates.length === 0) return [];

    // Bucket requests by the appropriate host (forecast vs archive). We
    // collapse each bucket into a single call by using the min/max date as
    // the start/end window.
    const sorted = [...dates].sort();
    const buckets = new Map<string, string[]>();
    for (const d of sorted) {
      const host = pickHostFor(d);
      if (!buckets.has(host)) buckets.set(host, []);
      buckets.get(host)!.push(d);
    }

    const all: DayWeather[] = [];
    for (const [host, group] of buckets) {
      const start = group[0];
      const end = group[group.length - 1];
      const url = new URL(host);
      url.searchParams.set("latitude", String(lat));
      url.searchParams.set("longitude", String(lng));
      url.searchParams.set("start_date", start);
      url.searchParams.set("end_date", end);
      url.searchParams.set(
        "daily",
        "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum"
      );
      url.searchParams.set("timezone", "auto");

      try {
        const res = await fetch(url.toString());
        if (!res.ok) {
          console.warn("[weather] open-meteo not ok", res.status);
          continue;
        }
        const json = (await res.json()) as {
          daily?: {
            time?: string[];
            weather_code?: number[];
            temperature_2m_max?: number[];
            temperature_2m_min?: number[];
            precipitation_sum?: number[];
          };
        };
        const d = json.daily ?? {};
        const times = d.time ?? [];
        for (let i = 0; i < times.length; i++) {
          const code = d.weather_code?.[i] ?? null;
          const meta = code !== null ? CODE_LABEL[code] : undefined;
          all.push({
            date: times[i],
            tempMaxC: d.temperature_2m_max?.[i] ?? null,
            tempMinC: d.temperature_2m_min?.[i] ?? null,
            precipMm: d.precipitation_sum?.[i] ?? null,
            code,
            label: meta?.label ?? "—",
            emoji: meta?.emoji ?? "·",
          });
        }
      } catch (err) {
        console.warn("[weather] fetch failed", err);
      }
    }

    // Filter to exactly the requested dates and de-dupe.
    const wanted = new Set(dates);
    const seen = new Set<string>();
    return all.filter((w) => {
      if (!wanted.has(w.date) || seen.has(w.date)) return false;
      seen.add(w.date);
      return true;
    });
  },
});
