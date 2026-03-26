import React from 'react';
import { ImageBackground, Pressable, Text, View } from 'react-native';
// import AvatarGroup from "./AvatarGroup";
import { TripWithEverything } from '@/hooks/useTripActions';
import { AvatarGroup } from '../containers/AvatarGroup';

interface TripCardProps {
  trip: TripWithEverything;
  fullWidth?: boolean;
}

const TripCard = ({ trip, fullWidth = false }: TripCardProps) => {
  return (
    <Pressable
      className="overflow-hidden rounded-2xl"
      onPress={() => {}}
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
              <Text className="text-xs font-semibold text-white">
                {trip.trip_details?.visibility}
              </Text>
              {/* TODO: Add role */}
            </View>
          </View>

          {/* Bottom info */}
          <View>
            <View className="flex-row items-end justify-between">
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-lg font-bold text-white"
                    style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
                    {trip.name}
                  </Text>

                  <AvatarGroup members={trip.group_members || []} />
                </View>
                <Text className="mt-0.5 text-sm text-white">
                  📍 {trip.destination_label}
                </Text>
              </View>
            </View>

            <Text className="mt-5 text-sm text-white">
              {trip.trip_details?.start_date} - {trip.trip_details?.end_date}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
};

export default TripCard;
