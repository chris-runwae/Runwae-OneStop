import DetailNotFound from '@/components/experience/DetailNotFound';
import ItineraryCard from '@/components/home/ItineraryCard';
import ItineraryHeader from '@/components/itinerary/ItineraryHeader';
import TemplateItineraryList from '@/components/itinerary/TemplateItineraryList';
import SectionHeader from '@/components/ui/SectionHeader';
import { Spacer } from '@/components';
import { AppFonts, Colors } from '@/constants';
import { useDetailItem } from '@/hooks/use-detail-item';
import { toItineraryTemplate } from '@/utils/adapters/toItineraryTemplate';
import { api } from '@runwae/convex/convex/_generated/api';
import type { Id } from '@runwae/convex/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View, useColorScheme } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ItineraryDetail = () => {
  type ColorScheme = keyof typeof Colors;
  const colorScheme = (useColorScheme() ?? 'light') as ColorScheme;
  const colors = Colors[colorScheme];

  // The hook returns the raw `itinerary_templates` doc (or null while
  // loading). We treat it as such here rather than re-mapping — the
  // template's full shape (`days`, `coverImageUrl`, etc.) is what this
  // screen needs to render the day-grouped item list.
  const { id, item: rawTemplate, loading } = useDetailItem('itinerary');
  const template = rawTemplate as any;

  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Pull the destination so we can show its name in the title row and on
  // the "More itineraries from <destination>" section, and use its id to
  // fetch sibling templates.
  const destinationId = template?.destinationId as
    | Id<'destinations'>
    | undefined;

  const destinationDoc = useQuery(
    api.destinations.list,
    destinationId ? {} : 'skip'
  );
  const destination = useMemo(() => {
    if (!destinationDoc || !destinationId) return null;
    return (
      destinationDoc.find(
        (d: any) =>
          (d._id as unknown as string) === (destinationId as unknown as string)
      ) ?? null
    );
  }, [destinationDoc, destinationId]);
  const destinationName = destination?.name as string | undefined;

  const moreTemplatesRaw = useQuery(
    api.itinerary.listByDestination,
    destinationId ? { destinationId, limit: 6 } : 'skip'
  );

  const moreTemplates = useMemo(() => {
    if (!moreTemplatesRaw) return [];
    const filtered = moreTemplatesRaw.filter(
      (t: any) => (t._id as unknown as string) !== id
    );
    return filtered
      .slice(0, 3)
      .map((t: any) =>
        toItineraryTemplate(t, { location: destinationName ?? '' })
      );
  }, [moreTemplatesRaw, id, destinationName]);

  if (loading) {
    return null;
  }

  if (!template) {
    return <DetailNotFound type="itinerary" />;
  }

  const coverUrl: string | undefined = template.coverImageUrl;
  const title: string = template.title;
  const description: string | undefined = template.description;
  const durationDays: number = template.durationDays;
  const days: any[] = template.days ?? [];
  const totalActivities = days.reduce(
    (acc, d) => acc + (d.items?.length ?? 0),
    0
  );

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.backgroundColors.default }}>
      <ItineraryHeader
        scrollY={scrollY}
        imageUri={coverUrl ?? ''}
        title={title}
      />

      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}>
        {coverUrl ? (
          <Image
            source={{ uri: coverUrl }}
            style={{ width: '100%', height: 300 }}
            contentFit="cover"
          />
        ) : (
          <View
            style={{
              height: 300,
              backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#e5e7eb',
            }}
          />
        )}

        <View
          style={{ backgroundColor: colors.backgroundColors.default }}
          className="px-5">
          <Spacer size={24} vertical />

          <Text style={[styles.title, { color: colors.textColors.default }]}>
            {title}
          </Text>

          <Spacer size={16} vertical />

          <View style={styles.badgesRow}>
            {destinationName ? (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      colorScheme === 'dark' ? '#1F1F1F' : '#F5F5F5',
                  },
                ]}>
                <Text
                  style={[
                    styles.badgeText,
                    { color: colors.textColors.subtle },
                  ]}
                  numberOfLines={1}>
                  📍 {destinationName}
                </Text>
              </View>
            ) : null}
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    colorScheme === 'dark' ? '#1F1F1F' : '#F5F5F5',
                },
              ]}>
              <Text
                style={[styles.badgeText, { color: colors.textColors.subtle }]}>
                🗓 {durationDays} day{durationDays === 1 ? '' : 's'}
              </Text>
            </View>
            {totalActivities > 0 && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      colorScheme === 'dark' ? '#1F1F1F' : '#F5F5F5',
                  },
                ]}>
                <Text
                  style={[
                    styles.badgeText,
                    { color: colors.textColors.subtle },
                  ]}>
                  ✨ {totalActivities} activit
                  {totalActivities === 1 ? 'y' : 'ies'}
                </Text>
              </View>
            )}
          </View>

          {description ? (
            <>
              <Spacer size={14} vertical />
              <Text
                style={[
                  styles.description,
                  { color: colors.textColors.default },
                ]}>
                {description}
              </Text>
            </>
          ) : null}
        </View>

        <Spacer size={32} vertical />

        <SectionHeader title="Itinerary" />
        <Spacer size={16} vertical />
        <TemplateItineraryList days={days} />

        {moreTemplates.length > 0 && (
          <>
            <Spacer size={32} vertical />
            <Text
              style={[styles.moreHeader, { color: colors.textColors.default }]}>
              More itineraries from {destinationName ?? 'this destination'}
            </Text>
            <Spacer size={16} vertical />
            <FlatList
              data={moreTemplates}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              renderItem={({ item }) => (
                <ItineraryCard item={item} fullWidth={false} />
              )}
            />
          </>
        )}
      </Animated.ScrollView>
    </View>
  );
};

export default ItineraryDetail;

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: AppFonts.bricolage.extraBold,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: AppFonts.inter.regular,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: AppFonts.inter.medium,
  },
  moreHeader: {
    fontSize: 20,
    fontFamily: AppFonts.bricolage.extraBold,
    letterSpacing: -0.3,
    paddingHorizontal: 20,
  },
});
