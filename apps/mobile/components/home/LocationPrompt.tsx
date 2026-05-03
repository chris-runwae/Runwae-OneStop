import { nearestIata } from '@/lib/iata';
import { api } from '@runwae/convex/convex/_generated/api';
import { useMutation } from 'convex/react';
import * as Location from 'expo-location';
import { MapPin, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse';

type ReverseAddress = {
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  country?: string;
};

async function reverseGeocode(coords: { lat: number; lng: number }) {
  const url = `${NOMINATIM_REVERSE}?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`;
  try {
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if (!res.ok) return null;
    const json = (await res.json()) as { address?: ReverseAddress };
    const a = json.address ?? {};
    const city = a.city ?? a.town ?? a.village ?? a.county ?? a.state ?? null;
    const country = a.country ?? null;
    return { city, country };
  } catch {
    return null;
  }
}

const LocationPrompt = () => {
  const setHomeLocation = useMutation(api.users.setHomeLocation);
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (dismissed) return null;

  async function handleEnable() {
    setBusy(true);
    setError(null);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        setError(
          'Permission denied. Set your location in profile to enable nearby suggestions.',
        );
        setBusy(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      const info = await reverseGeocode(coords);
      const iata = nearestIata(coords, info?.city ?? undefined) ?? undefined;
      await setHomeLocation({
        coords,
        city: info?.city ?? undefined,
        country: info?.country ?? undefined,
        iata,
      });
      setDismissed(true);
    } catch {
      setError('Could not save your location. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View className="mx-5 mt-3 mb-1 flex-row items-center gap-3 rounded-2xl border border-pink-200 bg-pink-50 px-3 py-3 dark:border-pink-900/50 dark:bg-pink-950/40">
      <View className="h-9 w-9 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/50">
        <MapPin size={16} color="#FF2E92" strokeWidth={2} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-[13px] font-semibold text-black dark:text-white">
          Set your home location
        </Text>
        <Text className="mt-0.5 text-[11.5px] text-gray-600 dark:text-gray-400">
          {error ??
            'Better flight + nearby tour suggestions. We only use it to power Discover.'}
        </Text>
      </View>
      <Pressable
        onPress={handleEnable}
        disabled={busy}
        className={`h-8 items-center justify-center rounded-full bg-pink-600 px-3 ${
          busy ? 'opacity-60' : ''
        }`}>
        <Text className="text-[12px] font-semibold text-white">
          {busy ? '…' : 'Enable'}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => setDismissed(true)}
        accessibilityLabel="Dismiss"
        className="h-7 w-7 items-center justify-center rounded-full">
        <X size={14} color="#6B7280" strokeWidth={2} />
      </Pressable>
    </View>
  );
};

export default LocationPrompt;
