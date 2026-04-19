import { StyleSheet, View, useColorScheme } from 'react-native';
import React from 'react';
import { Image } from 'expo-image';

import Text from '@/components/ui/Text';
import { COLORS, Colors, textStyles } from '@/constants';
import { getRandomGradient } from '../containers/AvatarGroup';
import { LinearGradient } from 'expo-linear-gradient';

type UserAvatarProps = {
  size?: number;
  imageUrl?: string | null;
  name: string;
};

const UserAvatar = ({ size = 40, imageUrl, name }: UserAvatarProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    container: {
      height: size,
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 99,
      overflow: 'hidden',
      backgroundColor: colors.borderColors.subtle,
    },
    image: {
      width: size,
      height: size,
      borderRadius: size / 2,
    },
    textStyle: {
      ...textStyles.textHeading16,
      color: COLORS.white.base,
    },
  });

  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  const gradientColors = getRandomGradient(name);

  return (
    <View style={styles.container}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
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
    </View>
  );
};

export default UserAvatar;
