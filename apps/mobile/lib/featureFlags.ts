import { useEffect, useState } from "react";

// PostHog's `isFeatureEnabled` only returns a stable answer after the
// client has fetched flags from /decide. We mirror that into a React
// state so consumers re-render when flags arrive. PostHog itself is
// loaded lazily by lib/analytics.ts; if it never loads (missing key,
// native module miss) we treat the flag as enabled in __DEV__ and
// disabled in production so launch gating still works.
export function useFeatureFlag(flagKey: string): boolean {
  const [enabled, setEnabled] = useState<boolean>(__DEV__);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    void (async () => {
      try {
        // Dynamic require so we don't accidentally bind the native module
        // at module-eval time — same defensive pattern as lib/analytics.ts.
        // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
        const mod = require("posthog-react-native");
        const PostHogCtor = mod?.default;
        if (!PostHogCtor) return;
        const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
        if (!apiKey) return;

        // PostHog v3 exposes a hook `usePostHog()` but we can't call it
        // from this module-level effect — fall back to the singleton
        // pattern from `lib/analytics.ts`. The constructor de-dupes by
        // apiKey internally.
        const ph = new PostHogCtor(apiKey, {
          host: process.env.EXPO_PUBLIC_POSTHOG_HOST,
          captureAppLifecycleEvents: false,
          enableSessionReplay: false,
        });

        await ph.reloadFeatureFlags();
        if (cancelled) return;
        const value = ph.isFeatureEnabled(flagKey);
        setEnabled(Boolean(value));
        const off = ph.onFeatureFlags?.(() => {
          if (cancelled) return;
          setEnabled(Boolean(ph.isFeatureEnabled(flagKey)));
        });
        unsubscribe = typeof off === "function" ? off : undefined;
      } catch {
        // PostHog unavailable: keep the initial __DEV__ default.
      }
    })();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [flagKey]);

  return enabled;
}
