import { StyleSheet, View, useColorScheme } from 'react-native';
import React from 'react';
import { Image } from 'expo-image';

import { Text } from '@/components';
import { Colors } from '@/constants';

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
      // width: size,
      // aspectRatio: 1,
      // borderRadius: 99,
    },
  });

  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  return (
    <View style={styles.container}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
        />
      ) : (
        <View style={styles.image}>
          <Text>{initials}</Text>
        </View>
      )}
    </View>
  );
};

export default UserAvatar;
