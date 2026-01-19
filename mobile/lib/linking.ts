// lib/linking.ts

/**
 * Deep linking configuration
 * Handles app navigation from external links
 */
import { Linking } from 'react-native';
import * as Notifications from 'expo-notifications';

export const linking = {
  prefixes: ['runwae://', 'https://runwae.com'],
  config: {
    screens: {
      events: {
        screens: {
          index: 'events',
          detail: 'events/:eventId',
          share: 'events/share/:eventId',
        },
      },
    },
  },
};

/**
 * Handle incoming deep links
 * Call this in your root layout or App.tsx
 */
export const setupDeepLinking = () => {
  // Handle initial URL (app opened from link)
  Linking.getInitialURL().then((url) => {
    if (url) {
      handleDeepLink(url);
    }
  });

  // Handle URL while app is running
  Linking.addEventListener('url', (event) => {
    handleDeepLink(event.url);
  });
};

const handleDeepLink = (url: string) => {
  console.log('Deep link received:', url);
  
  // Parse URL and navigate accordingly
  // Expo Router handles this automatically with the config above
  // This is just for logging/analytics
};

/**
 * Generate shareable event link
 */
export const generateEventLink = (eventId: string): string => {
  return `https://runwae.com/events/share/${eventId}`;
};

/**
 * Generate deep link for in-app navigation
 */
export const generateEventDeepLink = (eventId: string): string => {
  return `runwae://events/${eventId}`;
};