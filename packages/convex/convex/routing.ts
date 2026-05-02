import { v } from "convex/values";
import { action } from "./_generated/server";

// OpenRouteService — free key from openrouteservice.org → 2k req/day.
// We expose a single matrix call: given an ordered list of coords, return
// distance + duration for each consecutive leg. When ORS_API_KEY is unset
// or the request fails, we fall back to a haversine + 30 km/h estimate so
// the trip itinerary always renders something useful.
const ORS_BASE = "https://api.openrouteservice.org";

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export type Leg = { distanceKm: number; durationMin: number };

export const computeLegs = action({
  args: {
    coords: v.array(v.object({ lat: v.number(), lng: v.number() })),
    profile: v.optional(
      v.union(
        v.literal("driving-car"),
        v.literal("foot-walking"),
        v.literal("cycling-regular")
      )
    ),
  },
  handler: async (_ctx, { coords, profile }): Promise<Leg[]> => {
    if (coords.length < 2) return [];
    const apiKey = process.env.ORS_API_KEY;
    const mode = profile ?? "foot-walking";

    // Fallback: haversine + a walking/driving speed assumption.
    function fallback(): Leg[] {
      const speedKmh = mode === "driving-car" ? 35 : mode === "cycling-regular" ? 18 : 5;
      const out: Leg[] = [];
      for (let i = 0; i < coords.length - 1; i++) {
        const km = haversineKm(coords[i], coords[i + 1]);
        out.push({
          distanceKm: Math.round(km * 10) / 10,
          durationMin: Math.round((km / speedKmh) * 60),
        });
      }
      return out;
    }

    if (!apiKey) return fallback();

    try {
      // ORS matrix expects [lng, lat] pairs.
      const locations = coords.map((c) => [c.lng, c.lat]);
      const res = await fetch(`${ORS_BASE}/v2/matrix/${mode}`, {
        method: "POST",
        headers: {
          Authorization: apiKey,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locations,
          metrics: ["distance", "duration"],
          units: "km",
        }),
      });
      if (!res.ok) {
        console.warn("[ors] matrix not ok", res.status);
        return fallback();
      }
      const json = (await res.json()) as {
        durations?: number[][]; // seconds
        distances?: number[][]; // km
      };
      const out: Leg[] = [];
      for (let i = 0; i < coords.length - 1; i++) {
        const km = json.distances?.[i]?.[i + 1];
        const sec = json.durations?.[i]?.[i + 1];
        if (km === undefined || sec === undefined) {
          // Single-leg fallback if ORS skipped this pair (rare).
          const fb = haversineKm(coords[i], coords[i + 1]);
          out.push({
            distanceKm: Math.round(fb * 10) / 10,
            durationMin: Math.round((fb / 5) * 60),
          });
        } else {
          out.push({
            distanceKm: Math.round(km * 10) / 10,
            durationMin: Math.round(sec / 60),
          });
        }
      }
      return out;
    } catch (err) {
      console.warn("[ors] fetch failed", err);
      return fallback();
    }
  },
});
