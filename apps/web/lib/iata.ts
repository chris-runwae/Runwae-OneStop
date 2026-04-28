// Starter IATA table for major hubs. Maps a coordinate / city label to
// the most-used airport code so Duffel offer requests have an origin.
//
// Real-world replacement: Duffel `/places/suggestions` returns city + IATA
// for any free-text or coord. Until then this covers the first ~40 cities.
type Hub = { iata: string; lat: number; lng: number; aliases: readonly string[] };

const HUBS: readonly Hub[] = [
  { iata: "JFK", lat: 40.6413, lng: -73.7781, aliases: ["new york", "nyc", "manhattan", "brooklyn", "queens", "ny"] },
  { iata: "LHR", lat: 51.4700, lng: -0.4543, aliases: ["london", "uk", "england", "westminster", "camden", "hackney"] },
  { iata: "CDG", lat: 49.0097, lng: 2.5479, aliases: ["paris", "france"] },
  { iata: "AMS", lat: 52.3105, lng: 4.7683, aliases: ["amsterdam", "netherlands"] },
  { iata: "FRA", lat: 50.0379, lng: 8.5622, aliases: ["frankfurt", "germany"] },
  { iata: "MAD", lat: 40.4983, lng: -3.5676, aliases: ["madrid", "spain"] },
  { iata: "BCN", lat: 41.2974, lng: 2.0833, aliases: ["barcelona"] },
  { iata: "FCO", lat: 41.8003, lng: 12.2389, aliases: ["rome", "italy"] },
  { iata: "MXP", lat: 45.6306, lng: 8.7281, aliases: ["milan"] },
  { iata: "LIS", lat: 38.7813, lng: -9.1359, aliases: ["lisbon", "portugal"] },
  { iata: "DUB", lat: 53.4213, lng: -6.2701, aliases: ["dublin", "ireland"] },
  { iata: "EDI", lat: 55.9500, lng: -3.3725, aliases: ["edinburgh", "scotland"] },
  { iata: "MAN", lat: 53.3537, lng: -2.2750, aliases: ["manchester"] },
  { iata: "LBA", lat: 53.8659, lng: -1.6606, aliases: ["leeds", "bradford"] },
  { iata: "DXB", lat: 25.2532, lng: 55.3657, aliases: ["dubai", "uae"] },
  { iata: "AUH", lat: 24.4330, lng: 54.6511, aliases: ["abu dhabi"] },
  { iata: "DOH", lat: 25.2731, lng: 51.6086, aliases: ["doha", "qatar"] },
  { iata: "IST", lat: 41.2753, lng: 28.7519, aliases: ["istanbul", "turkey"] },
  { iata: "ATH", lat: 37.9364, lng: 23.9445, aliases: ["athens", "greece"] },
  { iata: "ZRH", lat: 47.4647, lng: 8.5492, aliases: ["zurich", "switzerland"] },
  { iata: "VIE", lat: 48.1103, lng: 16.5697, aliases: ["vienna", "austria"] },
  { iata: "CPH", lat: 55.6180, lng: 12.6561, aliases: ["copenhagen", "denmark"] },
  { iata: "ARN", lat: 59.6519, lng: 17.9186, aliases: ["stockholm", "sweden"] },
  { iata: "OSL", lat: 60.1976, lng: 11.1004, aliases: ["oslo", "norway"] },
  { iata: "HEL", lat: 60.3172, lng: 24.9633, aliases: ["helsinki", "finland"] },
  { iata: "LAX", lat: 33.9416, lng: -118.4085, aliases: ["los angeles", "la"] },
  { iata: "SFO", lat: 37.6213, lng: -122.3790, aliases: ["san francisco", "sf", "bay area"] },
  { iata: "ORD", lat: 41.9742, lng: -87.9073, aliases: ["chicago"] },
  { iata: "MIA", lat: 25.7959, lng: -80.2870, aliases: ["miami"] },
  { iata: "SEA", lat: 47.4502, lng: -122.3088, aliases: ["seattle"] },
  { iata: "BOS", lat: 42.3656, lng: -71.0096, aliases: ["boston"] },
  { iata: "YYZ", lat: 43.6777, lng: -79.6248, aliases: ["toronto"] },
  { iata: "MEX", lat: 19.4361, lng: -99.0719, aliases: ["mexico city", "cdmx"] },
  { iata: "GRU", lat: -23.4356, lng: -46.4731, aliases: ["sao paulo", "são paulo", "brazil"] },
  { iata: "EZE", lat: -34.8222, lng: -58.5358, aliases: ["buenos aires", "argentina"] },
  { iata: "JNB", lat: -26.1392, lng: 28.2460, aliases: ["johannesburg", "south africa"] },
  { iata: "CPT", lat: -33.9648, lng: 18.6017, aliases: ["cape town"] },
  { iata: "LOS", lat: 6.5774, lng: 3.3211, aliases: ["lagos", "nigeria"] },
  { iata: "ACC", lat: 5.6052, lng: -0.1668, aliases: ["accra", "ghana"] },
  { iata: "CAI", lat: 30.1219, lng: 31.4056, aliases: ["cairo", "egypt"] },
  { iata: "NBO", lat: -1.3192, lng: 36.9275, aliases: ["nairobi", "kenya"] },
  { iata: "BOM", lat: 19.0896, lng: 72.8656, aliases: ["mumbai", "bombay"] },
  { iata: "DEL", lat: 28.5562, lng: 77.1000, aliases: ["delhi", "new delhi"] },
  { iata: "BKK", lat: 13.6900, lng: 100.7501, aliases: ["bangkok", "thailand"] },
  { iata: "SIN", lat: 1.3644, lng: 103.9915, aliases: ["singapore"] },
  { iata: "HKG", lat: 22.3080, lng: 113.9185, aliases: ["hong kong"] },
  { iata: "ICN", lat: 37.4602, lng: 126.4407, aliases: ["seoul", "korea"] },
  { iata: "NRT", lat: 35.7720, lng: 140.3929, aliases: ["tokyo", "japan"] },
  { iata: "HND", lat: 35.5494, lng: 139.7798, aliases: ["haneda"] },
  { iata: "SYD", lat: -33.9399, lng: 151.1753, aliases: ["sydney", "australia"] },
  { iata: "MEL", lat: -37.6690, lng: 144.8410, aliases: ["melbourne"] },
  { iata: "AKL", lat: -37.0082, lng: 174.7850, aliases: ["auckland", "new zealand"] },
];

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function nearestIata(coords: { lat: number; lng: number }, label?: string): string | null {
  if (label) {
    const needle = label.toLowerCase();
    const byAlias = HUBS.find((h) => h.aliases.some((a) => needle.includes(a)));
    if (byAlias) return byAlias.iata;
  }
  let best: { iata: string; km: number } | null = null;
  for (const h of HUBS) {
    const km = haversineKm(coords, h);
    if (!best || km < best.km) best = { iata: h.iata, km };
  }
  // Anything within 400km of a hub is a reasonable origin.
  return best && best.km < 400 ? best.iata : null;
}
