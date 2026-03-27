import { Trip } from '@/constants/home.constant';
import { FileText, Users } from 'lucide-react-native';
import React from 'react';
import { Image, Platform, Pressable, Text, View } from 'react-native';
import AvatarGroup from './AvatarGroup';

interface TripCardProps {
  trip: Trip;
  fullWidth?: boolean;
}

const TripCard = ({ trip, fullWidth = false }: TripCardProps) => {
  return (
    <Pressable
      className="overflow-hidden rounded-[20px] bg-white p-[13px] dark:bg-dark-seconndary"
      onPress={() => {}}
      style={[
        { width: fullWidth ? '100%' : 320 },
        Platform.OS === 'ios'
          ? {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
            }
          : { elevation: 12 },
      ]}>
      <View className="h-[138px] w-full overflow-hidden rounded-[13px] border-[3px] border-white dark:border-dark-seconndary">
        <Image
          source={{ uri: trip.image }}
          className="h-full w-full"
          resizeMode="cover"
        />
      </View>

      <View className="pt-3">
        <Text
          className="mb-1 text-lg font-extrabold text-black dark:text-white"
          style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}
          numberOfLines={1}>
          {trip.title}
        </Text>

        <View className="mb-4 flex-row items-center">
          <View className="flex-row items-center border-r border-gray-200 pr-2 dark:border-gray-700">
            <Text className="mr-1 text-xs text-gray-500">📍</Text>
            <Text className="text-xs font-medium text-gray-500">
              {trip.location}
            </Text>
          </View>
          <View className="flex-row items-center pl-2">
            <Text className="mr-1 text-xs text-gray-500">⏳</Text>
            <Text className="text-xs font-medium text-gray-500">
              {trip.duration} to go!
            </Text>
          </View>
        </View>

        {/* Bottom Row: Pills & Avatars */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center rounded-[10px] border border-pink-200 bg-pink-50/80 px-2.5 py-1.5 dark:border-pink-900/50 dark:bg-pink-900/20">
            <View className="flex-row items-center">
              <Users size={14} color="#ec4899" strokeWidth={2.5} />
              <Text className="ml-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                {trip.members.length + trip.extraMembers} people
              </Text>
            </View>

            <View className="mx-2 h-3 w-[1px] bg-gray-300 dark:bg-gray-600" />

            <View className="flex-row items-center">
              <FileText size={14} color="#ec4899" strokeWidth={2.5} />
              <Text className="ml-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                {trip.items} items booked
              </Text>
            </View>
          </View>

          <View className="ml-2">
            <AvatarGroup
              members={trip.members}
              extraMembers={trip.extraMembers}
              maxDisplay={3}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default TripCard;
