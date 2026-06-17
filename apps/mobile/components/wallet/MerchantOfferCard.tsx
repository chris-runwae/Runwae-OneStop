import type { MerchantOffer } from '@/types/wallet.types';
import { Image } from 'expo-image';
import { MapPin, Tag } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface MerchantOfferCardProps {
  merchant: MerchantOffer;
  index: number;
  onPress: (merchant: MerchantOffer) => void;
}

const REWARD_TYPE_COLORS: Record<string, { pill: string; text: string }> = {
  cashback: { pill: '#10b981', text: '#fff' },
  discount: { pill: '#8b5cf6', text: '#fff' },
  perk: { pill: '#f59e0b', text: '#fff' },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const MerchantOfferCard: React.FC<MerchantOfferCardProps> = ({
  merchant,
  index,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const colors = REWARD_TYPE_COLORS[merchant.rewardType] ?? REWARD_TYPE_COLORS.cashback;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 80).duration(400).springify()}
      style={animatedStyle}
      className="mr-3">
      <AnimatedPressable
        onPressIn={() => {
          scale.value = withSpring(0.96, { damping: 15 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15 });
        }}
        onPress={() => onPress(merchant)}
        className="w-[160px] overflow-hidden rounded-[18px] bg-white dark:bg-dark-seconndary"
        style={Platform.OS === 'ios' ? styles.shadowIos : styles.shadowAndroid}>

        {/* Merchant image */}
        <View className="relative h-[110px] w-full">
          <Image
            source={{ uri: merchant.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          {/* Reward badge */}
          <View
            className="absolute bottom-2 left-2 rounded-full px-2 py-1"
            style={{ backgroundColor: colors.pill }}>
            <Text
              className="text-[10px] font-bold"
              style={{ color: colors.text, fontFamily: 'BricolageGrotesque-Bold' }}>
              {merchant.rewardValue}
            </Text>
          </View>
          {merchant.isNearby && (
            <View className="absolute right-2 top-2 flex-row items-center gap-x-0.5 rounded-full bg-black/60 px-1.5 py-0.5">
              <MapPin size={8} color="#fff" />
              <Text className="text-[9px] text-white">Nearby</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View className="p-3">
          <Text
            className="text-sm font-bold text-black dark:text-white"
            style={{ fontFamily: 'BricolageGrotesque-Bold' }}
            numberOfLines={1}>
            {merchant.name}
          </Text>
          <View className="mt-1 flex-row items-center gap-x-1">
            <Tag size={10} color="#9ca3af" />
            <Text className="text-[11px] text-gray-400" numberOfLines={1}>
              {merchant.category}
            </Text>
          </View>
          {merchant.eventName && (
            <Text className="mt-2 text-[10px] text-primary" numberOfLines={1}>
              via {merchant.eventName}
            </Text>
          )}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shadowIos: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  shadowAndroid: {
    elevation: 3,
  },
});

export default MerchantOfferCard;
