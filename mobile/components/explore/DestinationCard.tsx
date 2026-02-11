import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Text } from '@/components';
import { textStyles } from '@/utils/styles';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants';
import type { Destination } from '@/types/explore';

interface DestinationCardProps {
  item: Destination;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({ item }) => {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    card: {
      width: 280,
      marginRight: 16,
      borderRadius: 16,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: 200,
    },
    content: {
      padding: 12,
      backgroundColor: colors.backgroundColors.subtle,
    },
    title: {
      ...textStyles.bold_20,
      fontSize: 16,
      marginBottom: 4,
      color: colors.textColors.default,
    },
    location: {
      ...textStyles.subtitle_Regular,
      fontSize: 13,
      color: colors.textColors.subtle,
    },
  });

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/(tabs)/explore/destinations/${item.id}`)}
    >
      <Image
        source={{ uri: item.heroImage || item.thumbnailImage }}
        style={styles.image}
        contentFit="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.location}>
          {item.city}, {item.country}
        </Text>
      </View>
    </Pressable>
  );
};
