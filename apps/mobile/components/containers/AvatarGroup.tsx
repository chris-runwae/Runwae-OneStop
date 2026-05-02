import React, { useEffect } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  UIManager,
  Platform,
  useColorScheme,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import type { TripMember } from '@/hooks/useTripActions';
import { Colors, COLORS, textStyles } from '@/constants';

const GRADIENTS = [
  ['#FF6B6B', '#FFD93D'] as const,
  ['#6BCB77', '#4D96FF'] as const,
  ['#FF6B6B', '#6A4C93'] as const,
  ['#FFD93D', '#FF6B6B'] as const,
  ['#4D96FF', '#FF6B6B'] as const,
  ['#6A4C93', '#FFD93D'] as const,
  ['#FF9A8B', '#FF6B6B'] as const,
  ['#6BCB77', '#FFD93D'] as const,
  ['#FF6B6B', '#4D96FF'] as const,
  ['#FFD93D', '#6BCB77'] as const,
  ['#FF6B6B', '#FF9A8B'] as const,
  ['#4D96FF', '#6A4C93'] as const,
] as const;

type GradientTuple = (typeof GRADIENTS)[number];

export function getRandomGradient(seed: string): GradientTuple {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AvatarGroupProps = {
  members: TripMember[];
  maxVisible?: number;
  size?: number;
  overlap?: number;
  onPressAvatar?: (member: TripMember) => void;
};

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  members,
  maxVisible = 4,
  size = 40,
  overlap = 12,
  onPressAvatar,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [members]);

  const visible = members.slice(0, maxVisible);
  const remaining = members.length - maxVisible;

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      position: 'relative',
    },
    avatarWrapper: {
      position: 'absolute',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.white,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textStyle: {
      ...textStyles.regular_12,
      fontSize: size > 20 ? 12 : 10,
      color: COLORS.white.base,
    },
  });

  const totalCount = visible.length + (remaining > 0 ? 1 : 0);
  const containerWidth = totalCount > 0 ? (totalCount - 1) * (size - overlap) + size : 0;

  return (
    <View style={[styles.container, { height: size, width: containerWidth }]}>
      {visible.map((member, index) => {
        const name = member.user?.name ?? '';
        const initials = name
          ? name
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
          : '?';

        const gradientColors = getRandomGradient(
          name || (member.user?._id as unknown as string) || member._id,
        );

        const avatarUrl = member.user?.avatarUrl ?? member.user?.image;

        return (
          <Pressable
            key={member._id}
            onPress={() => onPressAvatar?.(member)}
            style={[
              styles.avatarWrapper,
              {
                left: index * (size - overlap),
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: size, height: size, borderRadius: size / 2 }}
              />
            ) : (
              <LinearGradient
                colors={gradientColors}
                start={[0, 0]}
                end={[1, 1]}
                style={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={styles.textStyle}>{initials}</Text>
              </LinearGradient>
            )}
          </Pressable>
        );
      })}

      {remaining > 0 && (
        <View
          style={[
            styles.avatarWrapper,
            {
              left: maxVisible * (size - overlap),
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: '#999',
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}>
          <Text style={styles.textStyle}>+{remaining}</Text>
        </View>
      )}
    </View>
  );
};
