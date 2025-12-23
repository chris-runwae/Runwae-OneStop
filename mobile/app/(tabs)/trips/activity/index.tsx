// app/activity/index.tsx
import React, { useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import BottomSheet from '@gorhom/bottom-sheet';
import { useActivityStore } from '@/stores/activityStore';

const { width } = Dimensions.get('window');

export default function ActivityDetailScreen() {
  const router = useRouter();
  const activity = useActivityStore((state) => state.currentActivity);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '75%'], []);

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
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.coverImage} />
        )}

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
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={[styles.button, styles.addToTripButton]}
          onPress={handleAddToTrip}>
          <Text style={styles.addToTripText}>Add to Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.bookButton]}
          onPress={handleBook}>
          <Text style={styles.buttonText}>Book Now</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet for Trip Selection */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose>
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Add to Trip</Text>
          <Text style={styles.bottomSheetSubtitle}>
            Select a trip to add this activity to
          </Text>
          {/* Placeholder for trip list */}
          <View style={styles.tripPlaceholder}>
            <Text style={styles.placeholderText}>
              Trip list will be displayed here
            </Text>
          </View>
        </View>
      </BottomSheet>
    </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
  },
  reviewSource: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewProvider: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reviewStats: {
    fontSize: 14,
    color: '#666',
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToTripButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2e7d32',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  bottomSheetSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  tripPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
  },
});
