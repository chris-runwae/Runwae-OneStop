import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight, Sparkles, X } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Pressable, ScrollView, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, AppFonts } from '@/constants';
import Spacer from '../utils/Spacer';
import Text from '../ui/Text';

const PRIMARY = '#FF2E92';

interface Props {
  seedDestination?: string;
  showCloseButton?: boolean;
  onDismiss?: () => void;
  title?: string;
}

export function CreateTripChooser({
  seedDestination,
  showCloseButton = true,
  onDismiss,
  title = 'Start a new trip',
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dark = useColorScheme() === 'dark';
  const colors = Colors[dark ? 'dark' : 'light'];

  const goManual = useCallback(() => {
    onDismiss?.();
    router.push({
      pathname: '/create-trip',
      params: seedDestination ? { seedDestination } : undefined,
    } as any);
  }, [router, onDismiss, seedDestination]);

  const goAi = useCallback(() => {
    onDismiss?.();
    router.push({
      pathname: '/create-trip-ai',
      params: seedDestination ? { seedDestination } : undefined,
    } as any);
  }, [router, onDismiss, seedDestination]);

  return (
    <View
      style={{
        paddingBottom: insets.bottom + 12,
        backgroundColor: colors.backgroundColors.default,
        paddingHorizontal: 12,
      }}>
      <View>
        <Text
          style={{
            fontFamily: AppFonts.bricolage.bold,
            fontSize: 24,
            paddingVertical: 12,
          }}>
          {title}
        </Text>
        {showCloseButton && (
          <Pressable
            onPress={onDismiss}
            accessibilityLabel="Close"
            hitSlop={12}
            className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10">
            <X size={18} color={dark ? '#fff' : '#0F0F0F'} strokeWidth={2.2} />
          </Pressable>
        )}
      </View>

      <Text
        style={{
          color: colors.textColors.subtle,
          fontSize: 13,
        }}>
        Pick how you want to start. You can always add more details later.
      </Text>

      <ScrollView
        contentContainerStyle={{ paddingTop: 20 }}
        showsVerticalScrollIndicator={false}>
        <ChoiceCard
          title="Create trip"
          description="Start blank — pick a destination, dates, and details. You'll build the itinerary yourself."
          onPress={goManual}
          dark={dark}
          primary
        />

        <Spacer size={12} vertical />

        <ChoiceCard
          title="Create with AI"
          description="Tell us roughly what you're looking for and we'll draft an itinerary for you to refine."
          icon={<Sparkles size={18} color={PRIMARY} strokeWidth={2.2} />}
          onPress={goAi}
          dark={dark}
        />

        <Spacer size={24} vertical />
      </ScrollView>
    </View>
  );
}

const ChoiceCard = ({
  title,
  description,
  icon,
  onPress,
  primary,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onPress: () => void;
  dark: boolean;
  primary?: boolean;
}) => {
  const dark = useColorScheme() === 'dark';
  const colors = Colors[dark ? 'dark' : 'light'];

  const primaryColor = colors.primaryColors.default;
  const backgroundColor = colors.backgroundColors.default;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
        marginBottom: 14,
      })}>
      <View
        className="overflow-hidden rounded-2xl"
        style={{
          backgroundColor: colors.backgroundColors.subtle,
        }}>
        {primary && (
          <LinearGradient
            colors={[colors.primaryColors.default, backgroundColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        )}
        <View
          className="flex-row items-start gap-3 px-5 py-5"
          style={{
            flexDirection: 'row',
            gap: 3,
            paddingHorizontal: 4,
            paddingVertical: 6,
          }}>
          <View className="min-w-0 flex-1">
            <Text
              style={{
                fontFamily: AppFonts.bricolage.semiBold,
                fontSize: 16,
              }}>
              {title}
            </Text>
            <Spacer size={4} vertical />
            <Text
              style={{
                fontFamily: AppFonts.inter.regular,
                fontSize: 13,
                lineHeight: 16.5,
                color: colors.textColors.subtle,
              }}>
              {description}
            </Text>
          </View>
          <View
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{
              backgroundColor: 'transparent',
              alignSelf: 'center',
            }}>
            <ArrowRight
              size={16}
              color={colors.textColors.default}
              strokeWidth={2.4}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
};
