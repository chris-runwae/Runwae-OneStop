import ExploreHero from '@/components/explore/ExploreHero';
import DestinationsForYou from '@/components/home/DestinationsForYou';
import ItineraryForYou from '@/components/home/IteneryForYou';
import ExploreSkeleton from '@/components/ui/ExploreSkeleton';
import Text from '@/components/ui/Text';
import { useExploreData } from '@/hooks/useExploreData';

import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useCallback } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacer, Text as AppText } from '@/components';
import { Colors, AppFonts } from '@/constants';

const SECTION_GAP = 32;

const ExploreScreen = () => {
  type ColorScheme = keyof typeof Colors;
  const colorScheme = (useColorScheme() ?? 'light') as ColorScheme;
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const { data, loading, refreshing, refresh } = useExploreData();
  const { itineraries, destinations } = data;

  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  if (loading) return <ExploreSkeleton />;

  return (
    <>
      <Spacer size={insets.top + 20} vertical />
      <Text style={[styles.header, { color: colors.textColors.default }]}>
        Explore
      </Text>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        style={{ alignContent: 'center' }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}>
        <ExploreHero destination={destinations[0]} />
        <Spacer size={SECTION_GAP} vertical />

        <ItineraryForYou
          data={itineraries}
          title="Featured Trip Itineraries"
          subtitle="Recommended by Runwae"
          loading={loading}
          noTopMargin
        />

        {destinations.length > 0 && (
          <>
            <Spacer size={SECTION_GAP} vertical />
            <DestinationsForYou
              data={destinations}
              title="Popular Destinations"
              subtitle="Places that everyone else is crazy about"
              loading={loading}
              noTopMargin
            />
          </>
        )}

        <Spacer size={SECTION_GAP} vertical />
        <View className="mx-5 mb-2 overflow-hidden rounded-2xl bg-primary">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/create' as any)}
            className="flex-row items-center justify-between px-5 py-5">
            <View className="flex-1 pr-4">
              <AppText
                replaceDefaultStyle
                testID="explore-footer-header"
                style={{
                  color: colors.backgroundColors.default,
                  fontFamily: AppFonts.bricolage.semiBold,
                  fontSize: 13,
                }}>
                Have a destination in mind?
              </AppText>
              <AppText
                className="mt-1"
                testID="explore-footer-text"
                style={{
                  color: colors.backgroundColors.default,
                  fontSize: 13,
                }}>
                Plan a trip in minutes — invite friends, vote, book.
              </AppText>
            </View>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <ArrowRight size={18} color="#fff" strokeWidth={2.4} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '50%',
  },
  header: {
    fontFamily: AppFonts.bricolage.bold,
    fontSize: 32,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});
