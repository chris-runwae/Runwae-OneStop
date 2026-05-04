import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight, Sparkles } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import type { Destination } from '@/types/content.types';

interface ExploreHeroProps {
  destination: Destination;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200';

const ExploreHero = ({ destination }: ExploreHeroProps) => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.navigate(`/destination/${destination.id}`)}
      className="mx-5 mt-4 overflow-hidden rounded-2xl"
      style={{ aspectRatio: 16 / 9 }}
    >
      <Image
        source={{ uri: destination.image || FALLBACK_IMAGE }}
        resizeMode="cover"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ position: 'absolute', inset: 0 }}
      />

      <View className="absolute left-3 top-3 flex-row items-center rounded-full bg-white/90 px-2.5 py-1">
        <Sparkles size={12} color="#FF2E92" strokeWidth={2.4} />
        <Text className="ml-1 text-[11px] font-bold text-black">Featured</Text>
      </View>

      <View className="absolute inset-x-0 bottom-0 flex-row items-end justify-between p-4">
        <View className="flex-1 pr-3">
          <Text
            className="text-2xl font-extrabold text-white"
            numberOfLines={1}
            style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}
          >
            {destination.title}
          </Text>
          {destination.location ? (
            <Text className="mt-0.5 text-sm text-white/80" numberOfLines={1}>
              {destination.location}
            </Text>
          ) : null}
        </View>

        <View className="flex-row items-center rounded-full bg-white px-3 py-2">
          <Text className="mr-1 text-xs font-bold text-black">Explore</Text>
          <ArrowRight size={14} color="#000" strokeWidth={2.4} />
        </View>
      </View>
    </Pressable>
  );
};

export default ExploreHero;
