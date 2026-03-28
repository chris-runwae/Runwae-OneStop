import React from 'react';
import { ImageBackground, Pressable, View, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

import { TripWithEverything } from '@/hooks/useTripActions';
import { AvatarGroup } from '../containers/AvatarGroup';
import Text from '../ui/Text';
import Spacer from '../utils/Spacer';
import { Colors, textStyles } from '@/constants/theme';
import { formatDateRange } from '@/utils/date';

interface TripCardProps {
  trip: TripWithEverything;
  fullWidth?: boolean;
}

const TripCard = ({ trip, fullWidth = false }: TripCardProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const visibilityText =
    trip.trip_details?.visibility === 'public' ? 'Public' : 'Private';

  return (
    <Pressable
      className="overflow-hidden rounded-2xl"
      onPress={() => {
        router.push(`/(tabs)/(trips)/${trip.id}`);
      }}
      style={{ width: fullWidth ? '100%' : 360, height: 210 }}>
      <ImageBackground
        source={{ uri: trip.cover_image_url ?? undefined }}
        className="flex-1"
        resizeMode="cover">
        <View
          className="flex-1 justify-between p-3"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          {/* Role badge */}
          <View className="flex-row justify-end">
            <View className="rounded-full bg-[#000000A6] px-3 py-1 dark:bg-dark-seconndary">
              <Text style={{ ...textStyles.textBody12, color: colors.white }}>
                {visibilityText}
              </Text>
              {/* TODO: Add role */}
            </View>
          </View>

          {/* Bottom info */}
          <View>
            <View className="flex-row items-end">
              <View className="flex-1">
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    // flex: 1,
                    // justifyContent: 'space-between',
                    gap: 8,
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      ...textStyles.textHeading20,
                      color: colors.white,
                      flex: 0.8, // takes remaining space, won't push AvatarGroup out
                    }}>
                    {trip.name}
                  </Text>
                  <AvatarGroup members={trip.group_members || []} size={20} />
                </View>
                <Text style={{ ...textStyles.textBody12, color: colors.white }}>
                  📍 {trip.destination_label}
                </Text>
              </View>
            </View>

            <Spacer size={4} vertical />
            <Text style={{ ...textStyles.textBody12, color: colors.white }}>
              {formatDateRange(
                trip.trip_details?.start_date ?? '',
                trip.trip_details?.end_date ?? ''
              )}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
};

export default TripCard;
