import * as AppleAuthentication from "expo-apple-authentication";
import * as Sentry from "@sentry/react-native";
import { useEffect } from "react";
import { Platform } from "react-native";

import { useAuth } from "@/context/AuthContext";

/**
 * Registers Apple's credentials-revoked listener at app launch. When a
 * user revokes Runwae in iOS Settings → Apple ID → Apps Using Apple ID,
 * iOS posts a notification on next app open — we catch it here and sign
 * the user out so they don't see a zombie session.
 *
 * No-op on Android/web. Required for App Review compliance.
 */
export function useAppleCredentialsRevoke() {
  const { signOut } = useAuth();

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    // expo-apple-authentication exposes addRevokeListener (returns an
    // EventSubscription). Fires when iOS posts the credentials-revoked
    // notification — typically on app foreground after the user revoked
    // access in Settings.
    const sub = AppleAuthentication.addRevokeListener(() => {
      void (async () => {
        try {
          await signOut();
        } catch (err) {
          Sentry.captureException(err, {
            tags: { source: "apple-credentials-revoked" },
          });
        }
      })();
    });
    return () => sub.remove();
  }, [signOut]);
}
