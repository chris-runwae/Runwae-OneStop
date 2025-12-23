// app/activity/index.tsx
import React, { useRef, useMemo } from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { Href, useRouter } from 'expo-router';
import BottomSheet from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useActivityStore } from '@/stores/activityStore';
import { Button, ScreenWithImage, Spacer, Text } from '@/components';
import { textStyles } from '@/utils/styles';
import { Colors } from '@/constants';
import { ExternalLink } from '@/components/external-link';

const { width } = Dimensions.get('window');

export default function ActivityDetailScreen() {
  const router = useRouter();
  const activity = useActivityStore((state) => state.currentActivity);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '75%'], []);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const dynamicStyles = StyleSheet.create({
    bottomButtons: {
      position: 'absolute',
      bottom: insets.bottom + 60,
      left: 0,
      right: 0,
      flexDirection: 'row',
      padding: 16,
      gap: 12,
    },
    addToTripButton: {
      backgroundColor: colors.backgroundColors.subtle,
      borderWidth: 2,
      borderColor: '#2e7d32',
    },
    tripPlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.borderColors.subtle,
      borderRadius: 8,
    },
  });

  if (!activity) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No activity data available</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const coverImage = activity.images.find((img) => img.isCover);
  const imageUrl =
    coverImage?.variants.find((v) => v.width === 720)?.url ||
    coverImage?.variants[0]?.url;

  const hasFreeCancel = activity.flags.includes('FREE_CANCELLATION');
  const isPrivate = activity.flags.includes('PRIVATE_TOUR');

  const handleBook = () => {
    if (activity.productUrl) {
      Linking.openURL(activity.productUrl);
    }
  };

  const handleAddToTrip = () => {
    bottomSheetRef.current?.expand();
  };

  return (
    <ScreenWithImage
      image={imageUrl || ''}
      leftComponent
      header={{ title: activity.title || '' }}>
      <ScrollView style={styles.scrollView}>
        {/* {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.coverImage} />
        )} */}

        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{activity.title}</Text>

          {/* Rating & Reviews */}
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>
              ⭐ {activity.reviews.combinedAverageRating.toFixed(1)}
            </Text>
            <Text style={styles.reviewCount}>
              ({activity.reviews.totalReviews} reviews)
            </Text>
          </View>

          {/* Badges */}
          <View style={styles.badgeContainer}>
            {hasFreeCancel && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Free Cancellation</Text>
              </View>
            )}
            {isPrivate && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Private Tour</Text>
              </View>
            )}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {activity.confirmationType === 'INSTANT'
                  ? 'Instant Confirmation'
                  : 'Confirmation Required'}
              </Text>
            </View>
          </View>

          {/* Duration & Price */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>
                {activity.duration.variableDurationFromMinutes}-
                {activity.duration.variableDurationToMinutes} min
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>From</Text>
              <Text style={styles.priceValue}>
                {activity.pricing.currency} $
                {activity.pricing.summary.fromPrice}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{activity.description}</Text>
          </View>

          {/* <Spacer size={16} vertical />
          <ExternalLink
            href={activity.productUrl as Href & string}
            style={[styles.button, styles.bookButton]}>
            <Text style={styles.buttonText}>Book Now</Text>
          </ExternalLink> */}

          {/* Review Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {activity.reviews.sources.map((source, index) => (
              <View key={index} style={styles.reviewSource}>
                <Text style={styles.reviewProvider}>{source.provider}</Text>
                <Text style={styles.reviewStats}>
                  {source.averageRating.toFixed(1)} ⭐ ({source.totalCount}{' '}
                  reviews)
                </Text>
              </View>
            ))}
          </View>
        </View>
        <Spacer size={insets.bottom + 24} vertical />
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={dynamicStyles.bottomButtons}>
        <TouchableOpacity
          style={[styles.button, dynamicStyles.addToTripButton]}
          onPress={handleAddToTrip}>
          <Text style={styles.addToTripText}>Add to Trip</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={[styles.button, styles.bookButton]}
          onPress={handleBook}>
          <Text style={styles.buttonText}>Book Now</Text>
        </TouchableOpacity> */}
        <ExternalLink
          href={activity.productUrl as Href & string}
          style={[styles.button, styles.bookButton, { alignItems: 'center' }]}>
          <Text style={[styles.buttonText, { textAlign: 'center' }]}>
            Book Now
          </Text>
        </ExternalLink>
      </View>

      {/* Bottom Sheet for Trip Selection */}
      {/* <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose>
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Add to Trip</Text>
          <Button
            variant="filled"
            onPress={() => bottomSheetRef.current?.close()}>
            <Text>Close</Text>
          </Button>
          <Text style={styles.bottomSheetSubtitle}>
            Select a trip to add this activity to
          </Text>

          <View style={dynamicStyles.tripPlaceholder}>
            <Text style={styles.placeholderText}>
              Trip list will be displayed here
            </Text>
          </View>
        </View>
      </BottomSheet> */}
    </ScreenWithImage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  coverImage: {
    width: width,
    height: width * 0.67,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    ...textStyles.bold_20,
    fontSize: 24,
    lineHeight: 28.8,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    ...textStyles.subtitle_Regular,
    fontSize: 16,
    marginRight: 8,
  },
  reviewCount: {
    ...textStyles.subtitle_Regular,
    fontSize: 14,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  badge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 20,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...textStyles.bold_20,
    fontSize: 18,
    marginBottom: 12,
  },
  description: {
    ...textStyles.regular_14,
    fontSize: 14,
    lineHeight: 22,
  },
  reviewSource: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewProvider: {
    ...textStyles.subtitle_Regular,
    fontSize: 14,
  },
  reviewStats: {
    ...textStyles.subtitle_Regular,
    fontSize: 14,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addToTripText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
  },
  bookButton: {
    backgroundColor: '#2e7d32',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  backButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  bottomSheetContent: {
    flex: 1,
    padding: 24,
  },
  bottomSheetTitle: {
    ...textStyles.bold_20,
    marginBottom: 8,
  },
  bottomSheetSubtitle: {
    ...textStyles.regular_14,
    marginBottom: 24,
  },

  placeholderText: {
    ...textStyles.regular_14,
  },
});
