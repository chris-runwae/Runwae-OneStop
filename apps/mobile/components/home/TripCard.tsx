import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FileText, Users } from 'lucide-react-native';
import React, { useMemo } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

import { AppFonts, COLORS } from '@/constants/theme';
import { useItineraryItemCount } from '@/hooks/useItineraryActions';
import { useTripMembers, type Trip } from '@/hooks/useTripActions';
import { formatDaysToGo, getDaysUntil } from '@/utils/date';
import { useTheme } from 'expo-router/react-navigation';
import { AvatarGroup } from '@/components/containers/AvatarGroup';

interface TripCardProps {
  trip: Trip;
  fullWidth?: boolean;
}

const TripCard = ({ trip, fullWidth = false }: TripCardProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const itemsCount = useItineraryItemCount(trip._id);
  const members = useTripMembers(trip._id) ?? [];

  const daysUntil = getDaysUntil(trip.startDate ?? '');
  const countdown = formatDaysToGo(daysUntil);

  const { dark } = useTheme();

  return (
    <Pressable
      onPress={() => {
        router.push(`/(tabs)/(trips)/${trip._id}`);
      }}
      className="bg-white dark:bg-dark-seconndary/50"
      style={[
        styles.card,
        {
          width: fullWidth ? '100%' : 340,
        },
        Platform.OS === 'ios' ? styles.shadowIos : styles.shadowAndroid,
      ]}>
      <View style={styles.imageContainer}>
        <TripCardImage uri={trip.coverImageUrl} />
        <TripStatusChip status={(trip as any).status} />
      </View>

      <View style={styles.infoContainer}>
        <Text
          style={[
            styles.title,
            { color: isDark ? COLORS.white.default : COLORS.black.default },
          ]}
          numberOfLines={1}>
          {trip.title}
        </Text>

        <View style={styles.metadataRow}>
          <View
            style={[
              styles.metadataCol,
              { borderRightColor: isDark ? '#374151' : '#E5E5E5' },
            ]}>
            <Text style={styles.emoji}>📍</Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.metadataText}>
              {trip.destinationLabel || 'TBD'}
            </Text>
          </View>
          <View
            style={[
              styles.metadataCol,
              { paddingLeft: 8, borderRightWidth: 0 },
            ]}>
            <Text style={styles.emoji}>⏳</Text>
            <Text style={styles.metadataText}>{countdown}!</Text>
          </View>
        </View>

        {/* Bottom Row: Pills & Avatars */}
        <View style={styles.bottomRow}>
          <View
            style={[
              styles.pillContainer,
              {
                borderColor: isDark ? 'rgba(131, 24, 67, 0.5)' : '#FBCFE8',
                backgroundColor: isDark
                  ? 'rgba(131, 24, 67, 0.2)'
                  : 'rgba(253, 242, 248, 0.8)',
              },
            ]}>
            <View style={styles.pillItem}>
              <Users size={14} color="#ec4899" strokeWidth={2.5} />
              <Text
                style={[
                  styles.pillText,
                  { color: isDark ? '#D1D5DB' : '#374151' },
                ]}>
                {members.length} {members.length === 1 ? 'person' : 'people'}
              </Text>
            </View>

            <View
              style={[
                styles.separator,
                { backgroundColor: isDark ? '#4B5563' : '#D1D5DB' },
              ]}
            />

            <View style={styles.pillItem}>
              <FileText size={14} color="#ec4899" strokeWidth={2.5} />
              <Text
                style={[
                  styles.pillText,
                  { color: isDark ? '#D1D5DB' : '#374151' },
                ]}>
                {itemsCount === undefined ? '...' : itemsCount}{' '}
                {itemsCount === 1 ? 'item' : 'items'}
              </Text>
            </View>
          </View>

          <View style={styles.avatarWrapper}>
            <AvatarGroup
              members={members}
              maxVisible={3}
              size={30}
              overlap={12}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

// Memoized so source identity is stable across parent re-renders. Without
// this, every parent render produces a new `{ uri }` literal which makes
// react-native Image refire the network request and orphan the previous
// in-flight one (visible as a flood of "Task orphaned for request" warns).
const TripCardImage = React.memo(({ uri }: { uri?: string | null }) => {
  const source = useMemo(
    () => ({
      uri:
        uri ??
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
    }),
    [uri]
  );
  return (
    <Image
      source={source}
      style={styles.image}
      contentFit="cover"
      cachePolicy="memory-disk"
      priority="high"
      transition={180}
      recyclingKey={uri ?? 'fallback'}
    />
  );
});
TripCardImage.displayName = 'TripCardImage';

type TripStatus =
  | 'planning'
  | 'upcoming'
  | 'ongoing'
  | 'completed'
  | 'cancelled';

const STATUS_LABEL: Record<TripStatus, string> = {
  planning: 'Planning',
  upcoming: 'Upcoming',
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_BG: Record<TripStatus, string> = {
  planning: 'rgba(123,104,238,0.92)',
  upcoming: 'rgba(245,166,35,0.95)',
  ongoing: 'rgba(76,175,130,0.95)',
  completed: 'rgba(107,107,107,0.85)',
  cancelled: 'rgba(107,107,107,0.85)',
};

function TripStatusChip({ status }: { status?: string }) {
  const key =
    (status as TripStatus) in STATUS_LABEL
      ? (status as TripStatus)
      : 'planning';
  return (
    <View style={[styles.statusChip, { backgroundColor: STATUS_BG[key] }]}>
      <View style={styles.statusDot} />
      <Text style={styles.statusText}>{STATUS_LABEL[key]}</Text>
    </View>
  );
}

export default TripCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  shadowIos: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  shadowAndroid: {
    elevation: 12,
  },
  imageContainer: {
    height: 170,
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
    objectFit: 'cover',
  },
  infoContainer: {
    padding: 13,
  },
  title: {
    marginBottom: 4,
    fontSize: 18,
    fontFamily: AppFonts.bricolage.extraBold,
  },
  metadataRow: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataCol: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRightWidth: 1,
    paddingRight: 8,
  },
  emoji: {
    marginRight: 4,
    fontSize: 12,
  },
  metadataText: {
    fontSize: 12,
    fontFamily: AppFonts.inter.medium,
    color: '#6B7280',
    maxWidth: 100,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillText: {
    marginLeft: 6,
    fontSize: 11,
    fontFamily: AppFonts.inter.medium,
  },
  separator: {
    marginHorizontal: 8,
    height: 12,
    width: 1,
  },
  avatarWrapper: {
    marginLeft: 8,
  },
  statusChip: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  statusText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
