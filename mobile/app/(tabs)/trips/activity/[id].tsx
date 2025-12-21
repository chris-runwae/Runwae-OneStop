import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';

import { InfoPill, ScreenContainer, Spacer, Text } from '@/components';
import { textStyles } from '@/utils/styles';
import { Colors } from '@/constants';

const ActivityDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activityData, setActivityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const dynamicStyles = StyleSheet.create({
    title: {
      color: colors.textColors.default,
    },
    divider: {
      height: 1,
      backgroundColor: colors.borderColors.default,
    },
    descriptionContainer: {
      borderTopWidth: 2,
      borderBottomWidth: 2,
      borderColor: colors.borderColors.default,
      paddingVertical: 20,
    },
    descriptionText: {
      ...textStyles.regular_14,
      color: colors.textColors.default,
    },
  });

  useEffect(() => {
    // TODO: Fetch activity data by id (productCode)
    // For now, we'll use placeholder data structure
    // In the future, this should call a hook or service to fetch activity details
    setLoading(false);
  }, [id]);

  const ImageContainer = () => {
    const mainImage =
      activityData?.images?.[0]?.variants?.[0]?.url ||
      'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80';

    return (
      <Pressable style={styles.imageContainer} onPress={() => {}}>
        <Image source={{ uri: mainImage }} style={styles.mainPhoto} />
        <Spacer size={8} vertical />
        {activityData?.images && activityData.images.length > 1 && (
          <View style={styles.helperImagesContainer}>
            {activityData.images
              .slice(1, 5)
              .map((image: any, index: number) => (
                <Image
                  key={index}
                  source={{ uri: image?.variants?.[0]?.url || mainImage }}
                  style={styles.image}
                />
              ))}
          </View>
        )}
      </Pressable>
    );
  };

  if (loading) {
    return (
      <ScreenContainer
        leftComponent
        contentContainerStyle={{ paddingHorizontal: 8 }}>
        <Text>Loading...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      leftComponent
      contentContainerStyle={{ paddingHorizontal: 8 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Spacer size={8} vertical />
        <ImageContainer />
        <Spacer size={8} vertical />
        <Text style={[styles.title, dynamicStyles.title]}>
          {activityData?.title || 'Activity'}
        </Text>

        <Spacer size={4} vertical />
        {activityData?.duration && (
          <View style={styles.locationTimeSpan}>
            <InfoPill
              type="duration"
              value={`${activityData.duration.fixedDurationInMinutes || activityData.duration.variableDurationInMinutes || 'N/A'} min`}
            />
            {activityData?.rating && (
              <InfoPill type="rating" value={activityData.rating.totalCount} />
            )}
          </View>
        )}
        <Spacer size={12} vertical />

        {activityData?.destinations && activityData.destinations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Destinations</Text>
            <Spacer size={8} vertical />
            {activityData.destinations.map((dest: any, index: number) => (
              <Text key={index} style={dynamicStyles.descriptionText}>
                {dest.destinationName || dest.name}
              </Text>
            ))}
            <Spacer size={16} vertical />
          </>
        )}

        {activityData?.tags && activityData.tags.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Tags</Text>
            <Spacer size={8} vertical />
            <View style={styles.tagsContainer}>
              {activityData.tags.map((tag: any, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>
                    {tag.tagName || tag.name || 'Tag'}
                  </Text>
                </View>
              ))}
            </View>
            <Spacer size={16} vertical />
          </>
        )}

        <Spacer size={32} vertical />
        <View style={dynamicStyles.descriptionContainer}>
          <Text style={dynamicStyles.descriptionText}>
            {activityData?.description || 'No description available'}
          </Text>
        </View>
        <Spacer size={16} vertical />

        {activityData?.productUrl && (
          <>
            <Text style={styles.sectionTitle}>Book Activity</Text>
            <Spacer size={8} vertical />
            <Text style={dynamicStyles.descriptionText}>
              Visit the booking page to reserve your spot.
            </Text>
            <Spacer size={16} vertical />
          </>
        )}

        <Spacer size={132} vertical />
      </ScrollView>
    </ScreenContainer>
  );
};

export default ActivityDetailScreen;

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  helperImagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  locationTimeSpan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  image: {
    flex: 1,
    height: 95,
  },
  mainPhoto: {
    width: '100%',
    height: 186,
  },
  title: {
    ...textStyles.bold_20,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0,
  },
  sectionTitle: {
    ...textStyles.bold_16,
    fontSize: 18,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    ...textStyles.regular_12,
    fontSize: 12,
  },
});
