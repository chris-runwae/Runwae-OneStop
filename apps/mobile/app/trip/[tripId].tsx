import { Redirect, useLocalSearchParams } from 'expo-router';

export default function TripUniversalLinkRedirect() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  if (!tripId) return <Redirect href="/(tabs)" />;
  return <Redirect href={`/(tabs)/(trips)/${tripId}` as any} />;
}
