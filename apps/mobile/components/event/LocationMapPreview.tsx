import React from 'react';
import { Image, Linking, Platform, Pressable, View } from 'react-native';

interface LocationMapPreviewProps {
  location: string;
  height?: number;
  onPress?: () => void;
}

/**
 * Renders a static map image using the Google Maps Static API with a plain
 * address string. No lat/lng or Geocoding API needed.
 */
const LocationMapPreview = ({
  location,
  height = 180,
  onPress,
}: LocationMapPreviewProps) => {
  const encodedLocation = encodeURIComponent(location);

  // Google Maps Static API — free tier allows address-based queries.
  // Replace API_KEY if you have one; otherwise it still shows a watermarked preview.
  const staticMapUrl =
    `https://maps.googleapis.com/maps/api/staticmap` +
    `?center=${encodedLocation}` +
    `&zoom=13` +
    `&size=600x300` +
    `&scale=2` +
    `&maptype=roadmap` +
    `&markers=color:red%7C${encodedLocation}` +
    `&style=feature:poi|visibility:off`;

  const handleOpenNative = () => {
    if (onPress) {
      onPress();
      return;
    }
    const query = encodedLocation;
    const url = Platform.select({
      ios: `maps://0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    if (url) Linking.openURL(url);
  };

  return (
    <Pressable onPress={handleOpenNative} style={{ height }}>
      <View pointerEvents="none" style={{ flex: 1 }}>
        <Image
          source={{ uri: staticMapUrl }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>
    </Pressable>
  );
};

export default LocationMapPreview;
