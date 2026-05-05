import { v } from "convex/values";
import { action } from "./_generated/server";

// Unsplash — free Developer key (5,000 req/hour for production after demo
// review). Sign up at https://unsplash.com/developers.
//
// We only use the search/photos endpoint here. Per Unsplash's API guidelines
// we surface the photographer attribution back to the client so trip pages
// can credit the source.
const UNSPLASH_BASE = "https://api.unsplash.com";

export type UnsplashPhoto = {
  id: string;
  // The 'regular' (1080px) variant — best balance for a trip cover.
  url: string;
  thumbUrl: string;
  altDescription: string | null;
  width: number;
  height: number;
  photographerName: string;
  photographerUrl: string;
  attributionUrl: string;
};

export const searchPhotos = action({
  args: {
    query: v.string(),
    perPage: v.optional(v.number()),
    orientation: v.optional(
      v.union(v.literal("landscape"), v.literal("portrait"), v.literal("squarish"))
    ),
  },
  handler: async (
    _ctx,
    { query, perPage, orientation }
  ): Promise<UnsplashPhoto[]> => {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      console.warn("[unsplash] UNSPLASH_ACCESS_KEY not set");
      return [];
    }
    if (!query.trim()) return [];

    const url = new URL(`${UNSPLASH_BASE}/search/photos`);
    url.searchParams.set("query", query.trim());
    url.searchParams.set("per_page", String(Math.min(perPage ?? 12, 30)));
    url.searchParams.set("content_filter", "high");
    if (orientation) url.searchParams.set("orientation", orientation);

    try {
      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          "Accept-Version": "v1",
        },
      });
      if (!res.ok) {
        console.warn("[unsplash] search not ok", res.status);
        return [];
      }
      const json = (await res.json()) as {
        results?: Array<{
          id: string;
          urls?: { regular?: string; small?: string };
          alt_description?: string | null;
          width?: number;
          height?: number;
          links?: { html?: string };
          user?: { name?: string; links?: { html?: string } };
        }>;
      };
      return (json.results ?? [])
        .filter((p) => p.urls?.regular)
        .map((p): UnsplashPhoto => ({
          id: p.id,
          url: p.urls!.regular!,
          thumbUrl: p.urls?.small ?? p.urls!.regular!,
          altDescription: p.alt_description ?? null,
          width: p.width ?? 0,
          height: p.height ?? 0,
          photographerName: p.user?.name ?? "Unknown",
          photographerUrl:
            p.user?.links?.html ?? "https://unsplash.com",
          // Unsplash attribution requires UTM params on the photo link.
          attributionUrl:
            (p.links?.html ?? "https://unsplash.com") +
            "?utm_source=runwae&utm_medium=referral",
        }));
    } catch (err) {
      console.error("[unsplash] fetch failed", err);
      return [];
    }
  },
});

// Per Unsplash API guidelines, hitting the download endpoint is required
// when the user actually picks a photo. Fire-and-forget; the response body
// isn't useful to us.
export const trackDownload = action({
  args: { photoId: v.string() },
  handler: async (_ctx, { photoId }): Promise<{ ok: boolean }> => {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) return { ok: false };
    try {
      await fetch(
        `${UNSPLASH_BASE}/photos/${encodeURIComponent(photoId)}/download`,
        {
          headers: {
            Authorization: `Client-ID ${accessKey}`,
            "Accept-Version": "v1",
          },
        }
      );
      return { ok: true };
    } catch {
      return { ok: false };
    }
  },
});
