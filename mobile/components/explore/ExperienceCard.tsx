import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Text } from '@/components';
import { textStyles } from '@/utils/styles';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants';
import type { Experience } from '@/types/explore';

interface ExperienceCardProps {
  item: Experience;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({ item }) => {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    card: {
      width: 350,
      marginRight: 18,
      backgroundColor: 'transparent',
      borderRadius: 16,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: 200,
    },
    content: {
      paddingTop: 16,
    },
    location: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.textColors.subtle,
      marginBottom: 4,
    },
    title: {
      ...textStyles.bold_20,
      fontSize: 18,
      marginBottom: 8,
      color: colors.textColors.default,
    },
    description: {
      ...textStyles.subtitle_Regular,
      fontSize: 13,
      color: colors.textColors.subtle,
      marginBottom: 12,
      lineHeight: 18,
    },
    price: {
      ...textStyles.bold_20,
      fontSize: 20,
      color: colors.textColors.default,
    },
    button: {
      backgroundColor: colors.primaryColors.default,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    buttonText: {
      ...textStyles.bold_20,
      fontSize: 14,
      color: colors.white,
    },
  });

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/(tabs)/explore/experiences/${item.id}`)}>
      <Image
        source={{ uri: item.heroImage }}
        style={styles.image}
        contentFit="cover"
        className="bg-gray-400/10"
      />
      <View style={styles.content}>
        <Text style={styles.location}>{item.location}</Text>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
          {item.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <View className="mt-5 flex flex-row items-center justify-between">
          <View className="flex-col">
            <Text className="text-xs font-light text-gray-400">From</Text>
            <Text style={styles.price}>
              ${item.priceFrom} {item.currency}
            </Text>
          </View>
          <Pressable
            style={styles.button}
            onPress={(e) => {
              e.stopPropagation();
              console.log('Add to trip:', item.id);
            }}>
            <Text style={styles.buttonText}>Add to trip</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};
