import React, { useMemo } from 'react';
import { StyleSheet, View, Pressable, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Calendar, Heart } from 'lucide-react-native';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';

import { ScreenContainer, Spacer, Text } from '@/components';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';
import { exploreDummyData } from '@/stores/exploreStore';
import type { Experience } from '@/types/explore';

export default function ItinerariesListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const itineraries = useMemo(() => {
    // Using featured experiences as itineraries
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
      marginBottom: 12,
    },
    metadataRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 12,
    },
    metadataPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: colors.borderColors.subtle,
      borderRadius: 20,
    },
    metadataText: {
      ...textStyles.subtitle_Regular,
      fontSize: 13,
      color: colors.textColors.default,
    },
    description: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      lineHeight: 20,
      color: colors.textColors.subtle,
    },
  });

  const renderItem = ({ item }: { item: Experience }) => {
    const itineraryItems = exploreDummyData.itineraries.filter(
      (it) => it.experienceId === item.id
    );
    const destination = exploreDummyData.destinations.find(
      (dest) => dest.id === item.destinationId
    );
    const days = Math.ceil(item.durationMinutes / (60 * 24));

    return (
      <Pressable
        style={styles.card}
        onPress={() => {
          router.push(`/(tabs)/explore/itineraries/${item.id}`);
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
          <View style={styles.metadataRow}>
            <View style={styles.metadataPill}>
              <MapPin size={14} color={colors.textColors.default} />
              <Text style={styles.metadataText}>
                {itineraryItems.length} activities
              </Text>
            </View>
            <View style={styles.metadataPill}>
              <Calendar size={14} color={colors.textColors.default} />
              <Text style={styles.metadataText}>{days} days</Text>
            </View>
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          {destination && (
            <Text
              style={[
                styles.description,
                { marginTop: 8, fontSize: 13, fontWeight: '500' },
              ]}>
              {destination.city}, {destination.country}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenContainer header={{ title: 'Featured Itineraries' }}>
      <FlashList
        data={itineraries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contentContainer}
        estimatedItemSize={320}
        ItemSeparatorComponent={() => <Spacer size={16} vertical />}
        ListFooterComponent={() => <Spacer size={120} vertical />}
      />
    </ScreenContainer>
  );
}
