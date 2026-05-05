import { Platform, Linking } from 'react-native';

interface DirectionsParams {
  title?: string;
  location: string;
}

export function useDirections() {
  const openDirections = ({ title, location }: DirectionsParams) => {
    if (!location) return;

    const query = encodeURIComponent(title ? `${title}, ${location}` : location);
    
    const url = Platform.select({
      ios: `maps://0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });

    if (url) {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback to browser
          const browserUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
          Linking.openURL(browserUrl);
        }
      });
    }
  };

  return { openDirections };
}
