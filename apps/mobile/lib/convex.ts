import { ConvexReactClient } from "convex/react";

const rawUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!rawUrl) {
  throw new Error(
    "EXPO_PUBLIC_CONVEX_URL is not set. Add it to apps/mobile/.env",
  );
}

// A trailing slash on the deployment URL makes ConvexReactClient build the
// sync path as `//api/<ver>/sync`, which the server 404s. The WebSocket then
// reconnect-loops and every auth call hangs until it times out. That shipped
// in prod (EXPO_PUBLIC_CONVEX_URL had a trailing slash) and surfaced as
// `auth_timeout:oauth-start:google`. Strip trailing slashes so a misconfigured
// env value can never reproduce it.
const url = rawUrl.replace(/\/+$/, "");

// Defense in depth: a release build must talk to the production Convex
// deployment. Metro caches the EXPO_PUBLIC_* Babel inlining without keying on
// the env value, so a locally-published OTA once baked the dev deployment URL
// into prod, silently pointing users at test data with prod accounts erroring.
// Fail loudly at launch instead. Dev builds intentionally use the dev
// deployment, so __DEV__ short-circuits this check (and skips the URL parse).
const PROD_CONVEX_HOST = "abundant-pika-833.convex.cloud";
if (!__DEV__ && new URL(url).host !== PROD_CONVEX_HOST) {
  throw new Error(
    `Release build pointed at non-production Convex (${url}). Expected host ` +
      `${PROD_CONVEX_HOST}. Likely a stale Metro cache or wrong env at bundle ` +
      `time. Clear caches and republish with the production environment.`,
  );
}

export const convex = new ConvexReactClient(url, {
  unsavedChangesWarning: false,
});
