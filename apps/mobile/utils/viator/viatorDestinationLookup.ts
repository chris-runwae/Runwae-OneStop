/**
 * Resolves a trip destination label to a Viator destination ref.
 * Results are cached in memory for the session — one API call per unique label.
 */

const _cache = new Map<string, string>();

function normalise(label: string): string {
  return label.trim().toLowerCase();
}

/**
 * Returns a Viator destination ref (e.g. "732") for the given label, or null
 * if the label is empty, the lookup API returns no results, or the request fails.
 *
 * Uses the same sandbox API key and base URL as viatorSearchSingleton.ts.
 */
export async function lookupViatorDestinationId(
  label: string | null | undefined
): Promise<string | null> {
  if (!label) return null;

  const key = normalise(label);
  if (_cache.has(key)) return _cache.get(key)!;

  try {
    const response = await fetch(
      'https://api.sandbox.viator.com/partner/v1/taxonomy/destinations',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json;version=2.0',
          'Content-Type': 'application/json;version=2.0',
          'exp-api-key': 'c6eb1e0b-45be-40d3-a855-513d36bd361e',
          'Accept-Language': 'en-US',
        },
        body: JSON.stringify({ textQuery: label, language: 'en', pageSize: 1 }),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    // Viator response: { destinations: [{ ref: "732", name: "...", ... }] }
    const ref: string | undefined = data?.destinations?.[0]?.ref;
    if (!ref) return null;

    _cache.set(key, ref);
    return ref;
  } catch {
    return null;
  }
}

/** Clear the cache (e.g. for testing or logout). */
export function clearDestinationCache(): void {
  _cache.clear();
}
