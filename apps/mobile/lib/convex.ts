import { ConvexReactClient } from "convex/react";

const rawUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!rawUrl) {
  throw new Error(
    "EXPO_PUBLIC_CONVEX_URL is not set. Add it to apps/mobile/.env",
  );
}

// A trailing slash on the deployment URL makes ConvexReactClient build the
// sync path as `//api/<ver>/sync`, which the server 404s — the WebSocket then
// reconnect-loops and every auth call hangs until it times out. That shipped
// in prod (EXPO_PUBLIC_CONVEX_URL had a trailing slash) and surfaced as
// `auth_timeout:oauth-start:google`. Strip trailing slashes so a misconfigured
// env value can never reproduce it.
const url = rawUrl.replace(/\/+$/, "");

export const convex = new ConvexReactClient(url, {
  unsavedChangesWarning: false,
});
