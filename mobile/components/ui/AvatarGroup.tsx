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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { TripAttendee } from '@/types/trips.types';
import { appColors, textStyles } from '@/utils/styles';

// define gradient tuples
const GRADIENTS = [
  ['#FF6B6B', '#FFD93D'] as const, // red → yellow
  ['#6BCB77', '#4D96FF'] as const, // green → blue
  ['#FF6B6B', '#6A4C93'] as const, // red → purple
  ['#FFD93D', '#FF6B6B'] as const, // yellow → red
  ['#4D96FF', '#FF6B6B'] as const, // blue → red
  ['#6A4C93', '#FFD93D'] as const, // purple → yellow
  ['#FF9A8B', '#FF6B6B'] as const, // coral → red
  ['#6BCB77', '#FFD93D'] as const, // green → yellow
  ['#FF6B6B', '#4D96FF'] as const, // red → blue
  ['#FFD93D', '#6BCB77'] as const, // yellow → green
  ['#FF6B6B', '#FF9A8B'] as const, // red → coral
  ['#4D96FF', '#6A4C93'] as const,
] as const;

// type for gradient tuple
type GradientTuple = (typeof GRADIENTS)[number];

// deterministic pick
function getRandomGradient(seed: string): GradientTuple {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AvatarGroupProps = {
  attendees: TripAttendee[];
  maxVisible?: number;
  size?: number;
  overlap?: number;
  onPressAvatar?: (attendee: TripAttendee) => void;
};

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  attendees,
  maxVisible = 4,
  size = 40,
  overlap = 12,
  onPressAvatar,
}) => {
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [attendees]);

  const visible = attendees.slice(0, maxVisible);
  const remaining = attendees.length - maxVisible;

  return (
    <View style={[styles.container, { height: size }]}>
      {visible.map((user, index) => {
        const initials = user.name
          ? user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
          : '?';

        const gradientColors = getRandomGradient(user.name || user.user_id);

        return (
          <Pressable
            key={user.user_id}
            onPress={() => onPressAvatar?.(user)}
            style={[
              styles.avatarWrapper,
              {
                left: index * (size - overlap),
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}>
            {user.profile_photo_url ? (
              <Image
                source={{ uri: user.profile_photo_url }}
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'relative',
  },
  avatarWrapper: {
    position: 'absolute',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#fff',
  },
  textStyle: {
    fontWeight: 'bold',
    ...textStyles.regular_12,
    color: appColors.white,
  },
});
