import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Text } from '@/components';
import { textStyles } from '@/utils/styles';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants';

interface ItineraryCardProps {
  item: {
    id: string;
    title: string;
    image_url: string;
    activity_count: number;
    duration_days: number;
  };
}

export const ItineraryCard: React.FC<ItineraryCardProps> = ({ item }) => {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    card: {
      width: 300,
      marginRight: 16,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: colors.backgroundColors.subtle,
    },
    image: {
      width: '100%',
      height: 200,
    },
    content: {
      padding: 12,
    },
    title: {
      ...textStyles.bold_20,
      fontSize: 16,
      marginBottom: 4,
      color: colors.textColors.default,
    },
    meta: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.textColors.subtle,
    },
    imageOverlay: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderRadius: 20,
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/(tabs)/explore/itineraries/${item.id}`)}>
      <View style={{ position: 'relative' }}>
        <Image
          source={{
            uri: item.image_url || 'https://via.placeholder.com/300x200',
          }}
          style={styles.image}
          contentFit="cover"
        />
        <View style={styles.imageOverlay}>
          <Heart size={18} color={colors.white} />
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>
          {item.activity_count || 0} activities • {item.duration_days || 0}{' '}
          {item.duration_days === 1 ? 'day' : 'days'}
        </Text>
      </View>
    </Pressable>
  );
};
