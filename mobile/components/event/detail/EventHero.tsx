import { DIFFICULTY_CONFIG, STATUS_CONFIG } from '@/components/event/detail/eventDetail.config';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, Zap } from 'lucide-react-native';
import React from 'react';
import { Image, Text, View } from 'react-native';

interface EventHeroProps {
  imageUri: string;
  status?: string;
  difficultyLevel?: string;
  isFeatured?: boolean;
}

const EventHero = ({
  imageUri,
  status,
  difficultyLevel,
  isFeatured,
}: EventHeroProps) => {
  const statusCfg =
    STATUS_CONFIG[status?.toLowerCase() ?? ''] ?? STATUS_CONFIG['active'];
  const difficulty = DIFFICULTY_CONFIG[difficultyLevel?.toLowerCase() ?? ''];

  return (
    <View className="relative h-[360px] w-full">
      <Image
        source={{ uri: imageUri }}
        className="h-full w-full"
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.72)']}
        locations={[0.3, 0.65, 1]}
        className="absolute inset-0"
      />
      <View
        className="absolute left-4 right-4 flex-row flex-wrap gap-2"
        style={{ bottom: 16 }}>
        <View className="rounded-full border border-white/20 bg-black/40 px-3 py-1">
          <Text
            className="text-[11px] font-semibold"
            style={{ color: statusCfg.color }}>
            {statusCfg.label}
          </Text>
        </View>

        {difficulty && (
          <View className="flex-row items-center gap-x-1 rounded-full border border-white/20 bg-black/40 px-3 py-1">
            <Zap size={10} color={difficulty.color} fill={difficulty.color} />
            <Text
              className="text-[11px] font-semibold"
              style={{ color: difficulty.color }}>
              {difficulty.label}
            </Text>
          </View>
        )}

        {isFeatured && (
          <View className="flex-row items-center gap-x-1 rounded-full border border-yellow-400/30 bg-yellow-400/20 px-3 py-1">
            <Star size={10} color="#fbbf24" fill="#fbbf24" />
            <Text className="text-[11px] font-semibold text-yellow-300">
              Featured
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default EventHero;
