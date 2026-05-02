import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { TokenStorage } from "@convex-dev/auth/react";

const SECURE_STORE_VALUE_LIMIT = 2048;

async function webGet(key: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

async function webSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
}

async function webRemove(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

export const secureStorage: TokenStorage = {
  getItem: async (key) => {
    if (Platform.OS === "web") return webGet(key);
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key, value) => {
    if (Platform.OS === "web") {
      await webSet(key, value);
      return;
    }
    if (value.length > SECURE_STORE_VALUE_LIMIT) {
      console.warn(
        `[secureStorage] value for "${key}" is ${value.length} bytes, larger than the SecureStore-recommended ${SECURE_STORE_VALUE_LIMIT} byte limit; iOS keychain will still accept it.`,
      );
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key) => {
    if (Platform.OS === "web") {
      await webRemove(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
