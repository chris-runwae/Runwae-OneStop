import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import React from 'react';
import { useUser } from '@clerk/clerk-expo';

import { Text, UserAvatar } from '@/components';
import { HelloWave } from '../hello-wave';
import { Colors } from '@/constants';
import { router } from 'expo-router';

const WelcomeAvatar = () => {
  const { user } = useUser();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (!user) {
    return <></>;
  }

  return (
    <Pressable onPress={() => router.push('/profile')} style={styles.container}>
      <UserAvatar size={48} />
      <View>
        <View style={styles.waveContainer}>
          <Text
            numberOfLines={1}
            style={[
              styles.waveText,
              styles.truncatedText,
              { color: colors.textColors.subtitle },
            ]}>
            Hey, {user?.firstName || user?.fullName || user?.username}{' '}
          </Text>
          <HelloWave size={16} />
        </View>
      </View>
    </Pressable>
  );
};

export default WelcomeAvatar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  waveText: {
    fontSize: 16,
  },
  truncatedText: {
    maxWidth: 120,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});
