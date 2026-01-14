import React, { useMemo } from 'react';
import { StyleSheet, View, Pressable, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Heart } from 'lucide-react-native';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';

import { ScreenContainer, Spacer, Text } from '@/components';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';
import { exploreDummyData } from '@/stores/exploreStore';
import type { Destination } from '@/types/explore';

export default function DestinationsListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const destinations = useMemo(() => {
    return exploreDummyData.destinations.filter((dest) => dest.isFeatured);
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
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
      backgroundColor: colors.backgroundColors.subtle,
    },
    imageContainer: {
      position: 'relative',
    },
    image: {
      width: '100%',
      height: 220,
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
      fontSize: 20,
      color: colors.textColors.default,
      marginBottom: 6,
    },
    location: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    locationText: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      color: colors.textColors.subtle,
    },
    description: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      lineHeight: 20,
      color: colors.textColors.subtle,
    },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    tag: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      backgroundColor: colors.borderColors.subtle,
      borderRadius: 12,
    },
    tagText: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.textColors.default,
    },
  });

  const renderItem = ({ item }: { item: Destination }) => (
    <Pressable
      style={styles.card}
      onPress={() => {
        router.push(`/(tabs)/explore/destinations/${item.id}`);
      }}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.heroImage || item.thumbnailImage }}
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
        <Text style={styles.title}>{item.name}</Text>
        <View style={styles.location}>
          <MapPin size={14} color={colors.textColors.subtle} />
          <Text style={styles.locationText}>
            {item.city}, {item.country}
          </Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {item.shortDescription}
        </Text>
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {item.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer header={{ title: 'Popular Destinations' }}>
      <FlashList
        data={destinations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contentContainer}
        ItemSeparatorComponent={() => <Spacer size={16} vertical />}
        ListFooterComponent={() => <Spacer size={120} vertical />}
      />
    </ScreenContainer>
  );
}
