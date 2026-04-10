import { useRouter } from 'expo-router';
import { FileText, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

import { AppFonts, COLORS } from '@/constants/theme';
import { fetchItineraryItemsCount } from '@/hooks/useItineraryActions';
import { TripWithEverything } from '@/hooks/useTripActions';
import { formatDaysToGo, getDaysUntil } from '@/utils/date';
import { useTheme } from '@react-navigation/native';
import AvatarGroup from './AvatarGroup';

interface TripCardProps {
  trip: TripWithEverything;
  fullWidth?: boolean;
}

const TripCard = ({ trip, fullWidth = false }: TripCardProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const [itemsCount, setItemsCount] = useState<number | null>(null);

  useEffect(() => {
    const getItemsCount = async () => {
      try {
        const count = await fetchItineraryItemsCount(trip.id);
        setItemsCount(count);
      } catch (err) {
        console.error('Error fetching itinerary items count:', err);
      }
    };
    getItemsCount();
  }, [trip.id]);

  const daysUntil = getDaysUntil(trip.trip_details?.start_date ?? '');
  const countdown = formatDaysToGo(daysUntil);

  // Map real group_members to the AvatarGroup props
  const displayMembers = (trip.group_members || []).slice(0, 3).map((m) => ({
    image: m.profiles?.avatar_url || undefined,
    initials: m.profiles?.full_name?.charAt(0) || '?',
  }));
  const extraCount = Math.max(0, (trip.group_members?.length || 0) - 3);
  const DARK_SEC = '#212529';

  const { dark } = useTheme();

  return (
    <Pressable
      onPress={() => {
        router.push(`/(tabs)/(trips)/${trip.id}`);
      }}
      className="bg-white dark:bg-dark-seconndary/50"
      style={[
        styles.card,
        {
          width: fullWidth ? '100%' : 340,
        },
        Platform.OS === 'ios' ? styles.shadowIos : styles.shadowAndroid,
      ]}>
      <View
        style={[
          styles.imageContainer,
          { borderColor: isDark ? COLORS.black.dark880 : COLORS.white.default },
        ]}>
        <Image
          source={{
            uri:
              trip.cover_image_url ??
              'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
          }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.infoContainer}>
        <Text
          style={[
            styles.title,
            { color: isDark ? COLORS.white.default : COLORS.black.default },
          ]}
          numberOfLines={1}>
          {trip.name}
        </Text>

        <View style={styles.metadataRow}>
          <View
            style={[
              styles.metadataCol,
              { borderRightColor: isDark ? '#374151' : '#E5E5E5' },
            ]}>
            <Text style={styles.emoji}>📍</Text>
            <Text style={styles.metadataText}>
              {trip.destination_label || 'TBD'}
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
                {trip.group_members?.length || 0}{' '}
                {(trip.group_members?.length || 0) === 1 ? 'person' : 'people'}
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
                {itemsCount === null ? '...' : itemsCount}{' '}
                {itemsCount === 1 ? 'item' : 'items'}
              </Text>
            </View>
          </View>

          <View style={styles.avatarWrapper}>
            <AvatarGroup
              members={displayMembers as any}
              extraMembers={extraCount}
              maxDisplay={3}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default TripCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 13,
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
    borderRadius: 13,
    borderWidth: 3,
  },
  image: {
    height: '100%',
    width: '100%',
    objectFit: 'cover',
  },
  infoContainer: {
    paddingTop: 12,
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
});
