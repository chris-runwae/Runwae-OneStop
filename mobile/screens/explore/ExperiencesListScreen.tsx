import React, { useMemo } from 'react';
import { StyleSheet, View, Pressable, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Star, Heart } from 'lucide-react-native';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';

import { ScreenContainer, Spacer, Text } from '@/components';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';
import { exploreDummyData } from '@/stores/exploreStore';
import type { Experience } from '@/types/explore';

export default function ExperiencesListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const experiences = useMemo(() => {
    return exploreDummyData.experiences.filter((exp) => exp.isFeatured);
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColors.default,
    },
    contentContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 32,
    },
    card: {
      backgroundColor: colors.backgroundColors.subtle,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
    },
    imageContainer: {
      position: 'relative',
    },
    image: {
      width: '100%',
      height: 200,
    },
    heartButton: {
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
    content: {
      padding: 16,
    },
    title: {
      ...textStyles.bold_20,
      fontSize: 18,
      color: colors.textColors.default,
      marginBottom: 8,
    },
    location: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    locationText: {
      ...textStyles.subtitle_Regular,
      fontSize: 13,
      color: colors.textColors.subtle,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    ratingText: {
      ...textStyles.subtitle_Regular,
      fontSize: 13,
      color: colors.textColors.default,
    },
    description: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      lineHeight: 20,
      color: colors.textColors.subtle,
      marginBottom: 12,
    },
    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    price: {
      ...textStyles.bold_20,
      fontSize: 18,
      color: colors.textColors.default,
    },
    addButton: {
      backgroundColor: colors.primaryColors.default,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 12,
    },
    addButtonText: {
      ...textStyles.bold_20,
      fontSize: 14,
      color: colors.white,
    },
  });

  const renderItem = ({ item }: { item: Experience }) => (
    <Pressable
      style={styles.card}
      onPress={() => {
        router.push(`/(tabs)/explore/experiences/${item.id}`);
      }}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.heroImage }}
          style={styles.image}
          contentFit="cover"
        />
        <Pressable
          style={styles.heartButton}
          onPress={(e) => {
            e.stopPropagation();
            // Handle favorite
          }}>
          <Heart size={18} color={colors.white} />
        </Pressable>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.location}>
          <MapPin size={14} color={colors.textColors.subtle} />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        <View style={styles.ratingRow}>
          <Star size={14} color="#FFD700" fill="#FFD700" />
          <Text style={styles.ratingText}>
            {item.rating} ({item.reviewCount} reviews)
          </Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            from ${item.priceFrom} {item.currency}
          </Text>
          <Pressable
            style={styles.addButton}
            onPress={(e) => {
              e.stopPropagation();
              // Handle add to trip
            }}>
            <Text style={styles.addButtonText}>Add to trip</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer header={{ title: 'Experience Highlights' }}>
      <FlashList
        data={experiences}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contentContainer}
        estimatedItemSize={350}
        ItemSeparatorComponent={() => <Spacer size={16} vertical />}
        ListFooterComponent={() => <Spacer size={120} vertical />}
      />
    </ScreenContainer>
  );
}
