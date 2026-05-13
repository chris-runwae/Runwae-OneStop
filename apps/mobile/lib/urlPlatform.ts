// Client-side mirror of packages/convex/convex/lib/urlPlatform.ts so the
// search screen can branch on platform before sending the URL to Convex.
// Keep in sync with the Convex copy — both are dependency-free.

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

const URL_REGEX =
  /https?:\/\/(?:www\.|m\.|vm\.|vt\.)?(?:youtube\.com|youtu\.be|tiktok\.com|music\.youtube\.com)\/[^\s]+/i;

export function extractVideoUrl(text: string): string | null {
  const match = text.match(URL_REGEX);
  return match ? match[0] : null;
}
