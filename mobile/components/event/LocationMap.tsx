import { useGeocode } from '@/hooks/useGeocode';
import { AppleMaps, GoogleMaps } from 'expo-maps';
import React from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';

interface LocationMapProps {
  location: string;
  eventTitle?: string;
  style?: object;
  /** Pass pre-existing coordinates from DB when available to skip geocoding */
  latitude?: number;
  longitude?: number;
}

const MapView = (props: any) =>
  Platform.OS === 'ios' ? (
    <AppleMaps.View {...props} />
  ) : (
    <GoogleMaps.View {...props} />
  );

/** Returns true if the coordinates are valid (non-zero, non-null) */
const isValidCoords = (lat?: number, lng?: number) =>
  !!lat && !!lng && lat !== 0 && lng !== 0;

const MapContent = ({
  latitude,
  longitude,
  title,
  style,
}: {
  latitude: number;
  longitude: number;
  title: string;
  style?: object;
}) => (
  <MapView
    style={style ?? { width: '100%', height: 180 }}
    cameraPosition={{
      coordinates: { latitude, longitude },
      zoom: 13,
    }}
    markers={[
      {
        coordinates: { latitude, longitude },
        title,
      },
    ]}
  />
);

/**
 * Shows a native map for an event location.
 *
 * Priority:
 * 1. Uses `latitude`/`longitude` from the DB directly if valid (fastest).
 * 2. Falls back to Nominatim geocoding using the `location` address string.
 * 3. Shows a simple label when both sources fail.
 */
const LocationMap = ({
  location,
  eventTitle,
  style,
  latitude,
  longitude,
}: LocationMapProps) => {
  // Only geocode when the DB coords are missing or zero
  const needsGeocode = !isValidCoords(latitude, longitude);
  const { coordinates, loading } = useGeocode(needsGeocode ? location : '');

  // — Fast path: valid DB coordinates
  if (isValidCoords(latitude, longitude)) {
    return (
      <MapContent
        latitude={latitude!}
        longitude={longitude!}
        title={eventTitle ?? location}
        style={style}
      />
    );
  }

  // — Loading geocode result
  if (loading) {
    return (
      <View
        style={[
          { 
            justifyContent: 'center', 
            alignItems: 'center', 
            backgroundColor: '#f3f4f6' 
          },
          style,
        ]}>
        <ActivityIndicator color="#FF2E92" />
      </View>
    );
  }

  // — Geocode succeeded
  if (coordinates) {
    return (
      <MapContent
        latitude={coordinates.latitude}
        longitude={coordinates.longitude}
        title={eventTitle ?? location}
        style={style}
      />
    );
  }

  // — Both sources failed: show a styled fallback
  return (
    <View
      style={[
        {
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f3f4f6',
        },
        style,
      ]}>
      <Text style={{ fontSize: 28 }}>🗺️</Text>
      <Text
        style={{
          marginTop: 8,
          fontSize: 13,
          color: '#6b7280',
          textAlign: 'center',
          paddingHorizontal: 16,
        }}>
        {location}
      </Text>
    </View>
  );
};

export default LocationMap;
