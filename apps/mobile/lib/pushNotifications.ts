import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";
import type { ConvexReactClient } from "convex/react";

import { api } from "@runwae/convex/convex/_generated/api";

// Expo push tokens are stable per (app install, device); we use a simple
// device id derived from `Constants.deviceId` (falls back to the
// installationId on web/dev) so the backend can dedupe per device.
function getDeviceId(): string {
  return (
    (Constants as any)?.deviceId ??
    (Constants as any)?.installationId ??
    "unknown-device"
  );
}

/**
 * Configure how foreground notifications render. Called once at app
 * boot so notifications surface as a banner/sound while the app is
 * active. Background delivery uses the OS defaults.
 */
export function configurePushHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Asks for push permission, fetches an Expo push token, and
 * registers it with the Convex backend. Safe to call repeatedly —
 * `api.push.registerToken` upserts the (userId, deviceId) pair.
 *
 * Returns the token (or null if permission denied / running in
 * Expo Go on iOS where push isn't supported).
 */
export async function registerPushNotifications(
  convex: ConvexReactClient,
): Promise<string | null> {
  // Android requires an explicit channel; the Expo Push API will fall
  // back to "default" for everything else.
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (status !== "granted") {
    const res = await Notifications.requestPermissionsAsync();
    status = res.status;
  }
  if (status !== "granted") return null;

  const projectId =
    (Constants?.expoConfig as any)?.extra?.eas?.projectId ??
    (Constants?.easConfig as any)?.projectId;

  let tokenResp: Notifications.ExpoPushToken;
  try {
    tokenResp = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
  } catch (err) {
    console.warn("[push] could not fetch Expo token", err);
    return null;
  }
  const token = tokenResp.data;

  try {
    await convex.mutation(api.push.registerToken, {
      token,
      platform: Platform.OS === "ios" ? "ios" : "android",
      deviceId: getDeviceId(),
    });
  } catch (err) {
    console.warn("[push] registerToken failed", err);
  }
  return token;
}

/** Flips the current device's token row to inactive. Called on sign-out. */
export async function unregisterPushNotifications(
  convex: ConvexReactClient,
  token: string,
) {
  try {
    await convex.mutation(api.push.unregisterToken, { token });
  } catch (err) {
    console.warn("[push] unregisterToken failed", err);
  }
}
