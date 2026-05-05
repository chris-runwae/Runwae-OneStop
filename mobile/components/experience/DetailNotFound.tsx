import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface DetailNotFoundProps {
  type: 'itinerary' | 'experience' | 'destination' | 'viator';
}

const DetailNotFound = ({ type }: DetailNotFoundProps) => {
  const router = useRouter();
  const label =
    type === 'itinerary'
      ? 'Itinerary'
      : type === 'experience'
        ? 'Experience'
        : type === 'viator'
          ? 'Tour'
          : 'Destination';

  return (
    <View className="flex-1 items-center justify-center bg-white px-8 dark:bg-black">
      <Image
        source={require('@/assets/images/search-empty-icon.png')}
        className="mb-8 h-32 w-32 opacity-60"
        resizeMode="contain"
      />
      <Text
        className="mb-2 text-center text-2xl font-bold dark:text-white"
        style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
        {label} not found
      </Text>
      <Text className="mb-10 text-center text-base leading-6 text-gray-500 dark:text-gray-400">
        We couldn&apos;t find the {type === 'viator' ? 'tour' : type}{' '}
        you&apos;re looking for. It might have been removed or the link is
        incorrect.
      </Text>
      <TouchableOpacity
        onPress={() => router.replace('/explore')}
        className="rounded-full bg-[#FF2E92] px-10 py-4 shadow-lg"
        style={{ elevation: 5 }}>
        <Text className="text-lg font-bold text-white">Return to Explore</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DetailNotFound;
