import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_PREFERENCE_KEY = 'runwae_theme_preference';

export type ThemePreference = 'light' | 'dark' | 'system';

/**
 * Saves the user's theme preference to local storage.
 * @param theme The selected theme ('light', 'dark', or 'system')
 */
export const saveThemePreference = async (theme: ThemePreference): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEME_PREFERENCE_KEY, theme);
  } catch (error) {
    console.error('Failed to save theme preference:', error);
  }
};

/**
 * Retrieves the user's theme preference from local storage.
 * @returns The stored theme preference or 'system' by default.
 */
export const getThemePreference = async (): Promise<ThemePreference> => {
  try {
    const theme = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
    return (theme as ThemePreference) || 'system';
  } catch (error) {
    console.error('Failed to retrieve theme preference:', error);
    return 'system';
  }
};
