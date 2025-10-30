import { Image } from 'expo-image';
import { Alert, Platform, StyleSheet } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, useRouter } from 'expo-router';
import { SignOutButton } from '@/components/SignOutButton';

import { getSupabaseClient } from '@/lib/supabase';

const TripsIndexScreen = () => {
  const router = useRouter();
  const { getToken, isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  // READ - Fetch all events for current user
  const fetchEvents = useCallback(async (): Promise<void> => {
    if (!user) {
      console.log('User not loaded yet');
      return;
    }

    setLoading(true);
    try {
      const supabase = await getSupabaseClient(getToken);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEvents(data || []);
      console.log('Events fetched:', data);
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching events:', err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }, [user, getToken]);

  // Fetch events on component mount
  useEffect(() => {
    if (userLoaded && authLoaded && user) {
      fetchEvents();
      console.log('Events fetched successfully');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoaded, userLoaded, user]);

  return (
    <ParallaxScrollView
    headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
    headerImage={
      <Image
        source={require('@/assets/images/partial-react-logo.png')}
        style={styles.reactLogo}
      />
    }>
    <ThemedView style={styles.titleContainer}>
      <ThemedText type="title">Welcome!</ThemedText>
      <HelloWave />
    </ThemedView>
    <ThemedView style={styles.stepContainer}>
      <ThemedText type="subtitle">Step 1: Try it</ThemedText>
      <ThemedText>
        Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
        Press{' '}
        <ThemedText type="defaultSemiBold">
          {Platform.select({
            ios: 'cmd + d',
            android: 'cmd + m',
            web: 'F12',
          })}
        </ThemedText>{' '}
        to open developer tools.
      </ThemedText>
    </ThemedView>
    <ThemedView style={styles.stepContainer}>
      <Link href="/modal">
        <Link.Trigger>
          <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        </Link.Trigger>
        <Link.Preview />
        <Link.Menu>
          <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
          <Link.MenuAction
            title="Share"
            icon="square.and.arrow.up"
            onPress={() => alert('Share pressed')}
          />
          <Link.Menu title="More" icon="ellipsis">
            <Link.MenuAction
              title="Delete"
              icon="trash"
              destructive
              onPress={() => alert('Delete pressed')}
            />
          </Link.Menu>
        </Link.Menu>
      </Link>

      <ThemedText>
        {`Tap the Explore tab to learn more about what's included in this starter app.`}
      </ThemedText>
    </ThemedView>
    <SignOutButton />
  </ParallaxScrollView>
  );
};

export default TripsIndexScreen;

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
