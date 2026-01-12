import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const createTokenCache = () => {
  return {
    getToken: async (key: string): Promise<string | null> => {
      try {
        if (Platform.OS === 'web') {
          return localStorage.getItem(key);
        }
        const item = await SecureStore.getItemAsync(key);
        console.log(
          '[TokenCache] Retrieved token for key:',
          key,
          item ? 'exists' : 'null'
        );
        return item;
      } catch (error) {
        console.error('[TokenCache] Error getting token:', error);
        return null;
      }
    },
    saveToken: async (key: string, token: string): Promise<void> => {
      try {
        if (Platform.OS === 'web') {
          localStorage.setItem(key, token);
          return;
        }
        await SecureStore.setItemAsync(key, token);
        console.log('[TokenCache] Saved token for key:', key);
      } catch (error) {
        console.error('[TokenCache] Error saving token:', error);
      }
    },
    clearToken: async (key: string): Promise<void> => {
      try {
        if (Platform.OS === 'web') {
          localStorage.removeItem(key);
          return;
        }
        await SecureStore.deleteItemAsync(key);
        console.log('[TokenCache] Cleared token for key:', key);
      } catch (error) {
        console.error('[TokenCache] Error clearing token:', error);
      }
    },
  };
};

export const tokenCache = createTokenCache();
