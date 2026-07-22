import { Image } from 'expo-image';
import { ImageIcon } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';

import { Text } from '@/components';
import { AppFonts, COLORS, Colors } from '@/constants';

type TemplateItem = {
  time?: string;
  endTime?: string;
  title: string;
  description?: string;
  type:
    | 'flight'
    | 'hotel'
    | 'tour'
    | 'car_rental'
    | 'event'
    | 'restaurant'
    | 'activity'
    | 'transport'
    | 'other';
  imageUrl?: string;
  locationName?: string;
  coords?: { lat: number; lng: number };
  estimatedCost?: number;
  currency?: string;
  externalUrl?: string;
};

type TemplateDay = {
  dayNumber: number;
  title?: string;
  items: TemplateItem[];
};

type TypeConfig = { label: string; emoji: string };
const TYPE_CONFIG: Record<TemplateItem['type'], TypeConfig> = {
  flight: { label: 'Flight', emoji: '✈️' },
  hotel: { label: 'Stay', emoji: '🏨' },
  tour: { label: 'Tour', emoji: '🚢' },
  car_rental: { label: 'Car', emoji: '🚙' },
  activity: { label: 'Relax', emoji: '🏝' },
  restaurant: { label: 'Dine', emoji: '🍽' },
  transport: { label: 'Transport', emoji: '🚗' },
  event: { label: 'Event', emoji: '🎫' },
  other: { label: 'Other', emoji: '📌' },
};

interface TemplateItemRowProps {
  item: TemplateItem;
}

function TemplateItemRow({ item }: TemplateItemRowProps) {
  type ColorScheme = keyof typeof Colors;
  const colorScheme = (useColorScheme() ?? 'light') as ColorScheme;
  const dark = colorScheme === 'dark';
  const colors = Colors[colorScheme];
  const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.other;
  const hasImage = !!item.imageUrl;

  const timeLabel = item.time
    ? item.endTime
      ? `${item.time} – ${item.endTime}`
      : item.time
    : null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundColors.default,
          borderColor: dark ? COLORS.gray[750] : '#EEEEEE',
        },
      ]}>
      {hasImage ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.thumbnail}
          contentFit="cover"
        />
      ) : (
        <View
          style={[
            styles.thumbnail,
            styles.thumbnailPlaceholder,
            { backgroundColor: dark ? '#1F1F1F' : '#F5F5F5' },
          ]}>
          <ImageIcon size={22} color={dark ? '#4B5563' : '#C9C9C9'} />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text
            style={[styles.title, { color: colors.textColors.default }]}
            numberOfLines={2}>
            {item.title}
          </Text>
          <View
            style={[
              styles.typeBadge,
              { borderColor: dark ? '#2D2D2D' : '#ECECEC' },
            ]}>
            <Text style={styles.typeBadgeEmoji}>{config.emoji}</Text>
            <Text
              style={[
                styles.typeBadgeLabel,
                { color: colors.textColors.subtle },
              ]}>
              {config.label}
            </Text>
          </View>
        </View>

        {item.locationName ? (
          <Text
            style={[styles.subtleText, { color: colors.textColors.subtle }]}
            numberOfLines={1}>
            {item.locationName}
          </Text>
        ) : null}

        {timeLabel ? (
          <Text
            style={[styles.subtleText, { color: colors.textColors.subtle }]}
            numberOfLines={1}>
            {timeLabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

interface TemplateItineraryListProps {
  days: TemplateDay[];
}

const TemplateItineraryList = ({ days }: TemplateItineraryListProps) => {
  type ColorScheme = keyof typeof Colors;
  const colorScheme = (useColorScheme() ?? 'light') as ColorScheme;
  const colors = Colors[colorScheme];

  if (!days || days.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.textColors.subtle }]}>
          This itinerary doesn&apos;t have any days yet.
        </Text>
      </View>
    );
  }

  const ordered = [...days].sort((a, b) => a.dayNumber - b.dayNumber);

  return (
    <View style={styles.list}>
      {ordered.map((day) => (
        <View key={day.dayNumber} style={styles.daySection}>
          <Text style={[styles.dayHeader, { color: colors.textColors.default }]}>
            Day {day.dayNumber}
            {day.title ? ` — ${day.title}` : ''}
          </Text>
          {day.items.length === 0 ? (
            <Text
              style={[
                styles.subtleText,
                { color: colors.textColors.subtle, marginTop: 4 },
              ]}>
              No activities planned for this day.
            </Text>
          ) : (
            day.items.map((item, idx) => (
              <View key={idx} style={styles.itemWrapper}>
                <TemplateItemRow item={item} />
              </View>
            ))
          )}
        </View>
      ))}
    </View>
  );
};

export default TemplateItineraryList;

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
  },
  daySection: {
    marginBottom: 24,
  },
  dayHeader: {
    fontSize: 17,
    fontFamily: AppFonts.bricolage.semiBold,
    letterSpacing: -0.1,
    marginBottom: 12,
  },
  itemWrapper: {
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 112,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 104,
    alignSelf: 'stretch',
    flexShrink: 0,
  },
  thumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 99,
    flexShrink: 0,
  },
  typeBadgeEmoji: {
    fontSize: 11,
  },
  typeBadgeLabel: {
    fontSize: 10,
    fontFamily: AppFonts.inter.medium,
    letterSpacing: 0.2,
  },
  title: {
    flex: 1,
    fontSize: 15,
    lineHeight: 19,
    fontFamily: AppFonts.bricolage.semiBold,
    letterSpacing: -0.1,
  },
  subtleText: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: AppFonts.inter.regular,
    lineHeight: 16,
  },
  empty: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: AppFonts.inter.regular,
  },
});
