import { v } from "convex/values";
import { action } from "./_generated/server";

/**
 * City / locality autocomplete used by the mobile create-trip and
 * destination pickers. Wraps LiteAPI's `data/places` endpoint so the
 * device never sees the LiteAPI key — that env var (`LITEAPI_KEY`) is
 * configured on the Convex deployment.
 *
 * The mobile client previously called LiteAPI directly with
 * `EXPO_PUBLIC_LITE_API_KEY`; the Phase 4 server-side move drops that
 * env var from the device.
 */
export const search = action({
  args: {
    query: v.string(),
    type: v.optional(v.string()),
  },
  handler: async (
    _ctx,
    { query, type },
  ): Promise<
    Array<{
      placeId: string;
      displayName: string;
      formattedAddress: string;
      types: string[];
    }>
  > => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    const apiKey = process.env.LITEAPI_KEY ?? "";
    if (!apiKey) return [];

    const baseUrl =
      process.env.LITEAPI_URL ?? "https://api.liteapi.travel/v3.0";
    const url = `${baseUrl}/data/places?textQuery=${encodeURIComponent(
      trimmed,
    )}&type=${encodeURIComponent(type ?? "locality")}`;

    try {
      const res = await fetch(url, { headers: { "X-API-Key": apiKey } });
      if (!res.ok) return [];
      const json = (await res.json()) as { data?: Array<Record<string, any>> };
      const raw = json?.data ?? [];
      return raw.map((item) => ({
        placeId: item.placeId ?? item.place_id ?? "",
        displayName:
          item.displayName?.text ??
          item.displayName ??
          item.name ??
          "",
        formattedAddress:
          item.formattedAddress ?? item.formatted_address ?? "",
        types: item.types ?? [],
      }));
    } catch {
      return [];
    }
  },
});
