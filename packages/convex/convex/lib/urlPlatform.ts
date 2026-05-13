// Pure helpers for detecting + canonicalizing video URLs. Lives outside
// the Convex action runtime so both the server (`media.ts`) and the
// mobile client (`apps/mobile/lib/urlPlatform.ts` mirror) reference one
// implementation. Keep this file dependency-free.

export type VideoPlatform = "youtube" | "tiktok" | "unknown";

const YT_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
]);

const TT_HOSTS = new Set([
  "tiktok.com",
  "www.tiktok.com",
  "m.tiktok.com",
  "vm.tiktok.com",
  "vt.tiktok.com",
]);

const TRACKING_KEYS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "feature",
  "si",
  "_r",
  "_t",
  "is_from_webapp",
  "sender_device",
  "web_id",
]);

export function detectPlatform(rawUrl: string): VideoPlatform {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return "unknown";
  }
  const host = url.hostname.toLowerCase();
  if (YT_HOSTS.has(host)) return "youtube";
  if (TT_HOSTS.has(host)) return "tiktok";
  return "unknown";
}

// Strip tracking params + normalise host/path so two equivalent shares of
// the same video produce the same canonical string. We DO NOT follow
// redirects here — short-link expansion (vt.tiktok.com → tiktok.com/@u/…)
// happens server-side in the extractor route, which has network access.
export function canonicalize(rawUrl: string): string {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return rawUrl.trim();
  }
  for (const key of Array.from(url.searchParams.keys())) {
    if (TRACKING_KEYS.has(key.toLowerCase())) {
      url.searchParams.delete(key);
    }
  }
  if (url.hostname.toLowerCase() === "www.youtube.com") {
    url.hostname = "youtube.com";
  }
  if (url.hostname.toLowerCase() === "m.tiktok.com") {
    url.hostname = "tiktok.com";
  }
  if (url.pathname.endsWith("/") && url.pathname !== "/") {
    url.pathname = url.pathname.slice(0, -1);
  }
  url.hash = "";
  return url.toString();
}

// YouTube IDs let us hit the timedtext (captions) endpoint without any
// API key. Returns null if the URL doesn't contain a recognisable id —
// the caller falls through to the extractor + Whisper path in that case.
export function youtubeVideoId(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (host === "youtu.be") {
    const seg = url.pathname.split("/").filter(Boolean)[0];
    return seg ?? null;
  }
  if (host.endsWith("youtube.com")) {
    const v = url.searchParams.get("v");
    if (v) return v;
    // Shorts: /shorts/<id>
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "shorts" && parts[1]) return parts[1];
    if (parts[0] === "embed" && parts[1]) return parts[1];
  }
  return null;
}
