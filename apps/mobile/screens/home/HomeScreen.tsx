import FindFriendsSheet from '@/components/social/FindFriendsSheet';
import FriendsActivity from '@/components/home/FriendsActivity';
import HeroFeatured from '@/components/home/HeroFeatured';
import ImportsInProgressPill from '@/components/home/ImportsInProgressPill';
import LocationPrompt from '@/components/home/LocationPrompt';
import OpenPollCard from '@/components/home/OpenPollCard';
import WelcomeModal from '@/components/WelcomeModal';
import { useAuth } from '@/context/AuthContext';
import { api } from '@runwae/convex/convex/_generated/api';
import { useTheme } from 'expo-router/react-navigation';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { Bell } from 'lucide-react-native';

// Consistent vertical rhythm between every home section. 32px is the
// standard mobile section gap and gives the page enough breathing room
// without feeling sparse on smaller phones.
const SECTION_GAP = 32;

export default function HomeScreen() {
  const router = useRouter();
  const { showWelcomeModal, setShowWelcomeModal, user } = useAuth();
  const { dark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [findFriendsOpen, setFindFriendsOpen] = useState(false);

  const viewer = useQuery(api.users.getCurrentUser, {});
  const showLocationPrompt =
    viewer !== undefined && viewer !== null && !viewer.homeCoords;

  const onRefresh = () => {};

  return (
    <>
      <Stack.Screen
        options={{
          title: `Hello ${user?.full_name ?? 'there'}`,
          headerLargeTitle: false,
          headerShown: true,
          headerShadowVisible: false,
          headerTitleAlign: 'left',

          // headerLeft: () => (
          //   <Pressable
          //     testID="home-notification-bell"
          //     onPress={() => router.push('/notifications')}>
          //     <Bell size={16} />
          //   </Pressable>
          // ),
          headerRight: () => (
            <Pressable
              testID="home-notification-bell"
              onPress={() => router.push('/notifications')}>
              <Bell size={16} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 32,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={dark ? '#ffffff' : '#000000'}
          />
        }>
        {showLocationPrompt && (
          <View style={{ marginBottom: SECTION_GAP }}>
            <LocationPrompt />
          </View>
        )}

        <View style={{ gap: SECTION_GAP }}>
          <ImportsInProgressPill />

          <HeroFeatured />
          {/* <UpcomingTrips trips={upcomingTrips} loading={loading} /> */}

          <OpenPollCard />
          <FriendsActivity onFindFriends={() => setFindFriendsOpen(true)} />
        </View>
        <View style={{ height: 1400 }} />
      </ScrollView>

      <WelcomeModal
        visible={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />
      <FindFriendsSheet
        open={findFriendsOpen}
        onClose={() => setFindFriendsOpen(false)}
      />
    </>
  );
}
