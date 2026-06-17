import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard, Sparkles, Zap } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface WalletEmptyStateProps {
  onLinkCard: () => void;
}

const WalletEmptyState: React.FC<WalletEmptyStateProps> = ({ onLinkCard }) => {
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1200 }),
        withTiming(1, { duration: 1200 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(600)}
      className="mx-5 overflow-hidden rounded-[24px]">
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-8">

        {/* Icon cluster */}
        <View className="mb-8 items-center">
          <Animated.View style={pulseStyle}>
            <View className="relative h-20 w-20 items-center justify-center rounded-full bg-white/10">
              <CreditCard size={36} color="rgba(255,255,255,0.7)" strokeWidth={1.5} />
              {/* Floating badges */}
              <View className="absolute -right-1 -top-1 h-7 w-7 items-center justify-center rounded-full bg-primary">
                <Zap size={12} color="#fff" />
              </View>
            </View>
          </Animated.View>

          {/* Orbiting dots */}
          <View className="mt-3 flex-row gap-x-1.5">
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: `rgba(255,46,146,${0.8 - i * 0.25})` }}
              />
            ))}
          </View>
        </View>

        {/* Copy */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          className="mb-2 items-center">
          <Text
            className="text-center text-2xl font-bold text-white"
            style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
            Your pass to event perks
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          className="mb-8 items-center">
          <Text className="text-center text-sm leading-5 text-white/50">
            Link your card to automatically earn cashback, discounts, and
            exclusive perks at every partner merchant.
          </Text>
        </Animated.View>

        {/* Perks preview */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          className="mb-8 flex-row justify-center gap-x-4">
          {[
            { emoji: '🍽️', label: 'Restaurants' },
            { emoji: '💈', label: 'Grooming' },
            { emoji: '🛋️', label: 'Lounges' },
          ].map((perk) => (
            <View key={perk.label} className="items-center gap-y-1">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <Text className="text-lg">{perk.emoji}</Text>
              </View>
              <Text className="text-[10px] text-white/40">{perk.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* CTA */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <TouchableOpacity
            onPress={onLinkCard}
            className="flex-row items-center justify-center gap-x-2 rounded-full bg-primary py-4">
            <Sparkles size={16} color="#fff" />
            <Text
              className="text-sm font-bold text-white"
              style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
              Link Card & Start Earning
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(600).duration(500)}
          className="mt-3 items-center">
          <Text className="text-center text-[11px] text-white/30">
            Your card details are never stored. Rewards are detected automatically.
          </Text>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
};

export default WalletEmptyState;
