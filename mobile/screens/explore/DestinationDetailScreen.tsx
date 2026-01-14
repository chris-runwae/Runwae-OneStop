import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, Star, Heart } from 'lucide-react-native';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';

import {
  ScreenWithImage,
  SectionHeader,
  Spacer,
  Text,
  StarRating,
} from '@/components';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';
import { exploreDummyData } from '@/stores/exploreStore';
import type { Destination, Experience, Review } from '@/types/explore';

type FilterType = 'all' | 'eat' | 'stay' | 'do' | 'shop';

export default function DestinationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [showMoreDescription, setShowMoreDescription] = useState(false);

  const destination = useMemo(() => {
    return exploreDummyData.destinations.find((dest) => dest.id === id);
  }, [id]);

  const experiences = useMemo(() => {
    if (!destination) return [];
    return exploreDummyData.experiences.filter(
      (exp) => exp.destinationId === destination.id
    );
  }, [destination]);

  const similarDestinations = useMemo(() => {
    if (!destination) return [];
    return exploreDummyData.destinations
      .filter((dest) => dest.id !== destination.id && dest.isFeatured)
      .slice(0, 5);
  }, [destination]);

  const reviews = useMemo(() => {
    if (!destination) return [];
    // Get reviews from experiences in this destination
    const expIds = experiences.map((e) => e.id);
    return exploreDummyData.reviews.filter((rev) =>
      expIds.includes(rev.experienceId)
    );
  }, [destination, experiences]);

  const descriptionText = destination
    ? `Welcome to ${destination.name}, ${destination.country}! ${destination.shortDescription} Embark on a culinary adventure through the bustling markets. Savor flavorful local cuisine, discover the secrets of traditional drinks, and connect with local vendors. Immerse yourself in local hospitality as you explore the cultural heritage, lively music, and unforgettable flavors. Join us on this adventure, where every dish tells a story and every moment is a celebration of life, culture, and community.`
    : '';

  const filters: { id: FilterType; label: string; icon?: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'eat', label: 'Eat/Drink', icon: '🍹' },
    { id: 'stay', label: 'Stay', icon: '🏨' },
    { id: 'do', label: 'Do', icon: '📍' },
    { id: 'shop', label: 'Shop', icon: '🛍️' },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColors.default,
    },
    content: {
      paddingBottom: 32,
    },
    title: {
      ...textStyles.bold_20,
      fontSize: 24,
      lineHeight: 32,
      color: colors.textColors.default,
      marginBottom: 12,
    },
    metadataRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 16,
    },
    metadataItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    metadataText: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      color: colors.textColors.default,
    },
    description: {
      ...textStyles.subtitle_Regular,
      fontSize: 15,
      lineHeight: 22,
      color: colors.textColors.subtle,
      marginBottom: 16,
    },
    showMoreButton: {
      marginTop: 8,
      marginBottom: 24,
    },
    showMoreText: {
      ...textStyles.bold_20,
      fontSize: 14,
      color: colors.primaryColors.default,
    },
    categoriesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 24,
    },
    categoryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: colors.borderColors.subtle,
      borderRadius: 20,
    },
    categoryText: {
      ...textStyles.subtitle_Regular,
      fontSize: 13,
      color: colors.textColors.default,
    },
    section: {
      marginBottom: 32,
    },
    filterRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    filterButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
    },
    filterButtonActive: {
      backgroundColor: colors.primaryColors.default,
      borderColor: colors.primaryColors.default,
    },
    filterButtonInactive: {
      backgroundColor: 'transparent',
      borderColor: colors.borderColors.subtle,
    },
    filterText: {
      ...textStyles.subtitle_Regular,
      fontSize: 13,
    },
    recommendationCard: {
      width: 180,
      marginRight: 12,
      backgroundColor: colors.backgroundColors.subtle,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
    },
    recommendationImage: {
      width: '100%',
      height: 120,
    },
    recommendationContent: {
      padding: 12,
    },
    recommendationTitle: {
      ...textStyles.bold_20,
      fontSize: 15,
      color: colors.textColors.default,
      marginBottom: 4,
    },
    recommendationDescription: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      lineHeight: 16,
      color: colors.textColors.subtle,
      marginBottom: 8,
    },
    recommendationActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    viewDetailsText: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.primaryColors.default,
    },
    addButton: {
      backgroundColor: colors.primaryColors.default,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    addButtonText: {
      ...textStyles.bold_20,
      fontSize: 12,
      color: colors.white,
    },
    reviewCard: {
      marginBottom: 20,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColors.subtle,
    },
    reviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 12,
    },
    reviewAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    reviewUserInfo: {
      flex: 1,
    },
    reviewName: {
      ...textStyles.bold_20,
      fontSize: 15,
      color: colors.textColors.default,
      marginBottom: 2,
    },
    reviewUsername: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.textColors.subtle,
    },
    reviewRating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    reviewDate: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.textColors.subtle,
      marginTop: 4,
    },
    reviewComment: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      lineHeight: 20,
      color: colors.textColors.default,
      marginTop: 8,
    },
    destinationCard: {
      width: 240,
      marginRight: 16,
      borderRadius: 16,
      overflow: 'hidden',
    },
    destinationImage: {
      width: '100%',
      height: 160,
    },
    destinationContent: {
      padding: 12,
      backgroundColor: colors.backgroundColors.subtle,
    },
    destinationTitle: {
      ...textStyles.bold_20,
      fontSize: 16,
      color: colors.textColors.default,
      marginBottom: 4,
    },
    destinationLocation: {
      ...textStyles.subtitle_Regular,
      fontSize: 13,
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
    sectionTitle: {
      ...textStyles.bold_20,
      fontSize: 20,
      color: colors.textColors.default,
      marginBottom: 16,
    },
  });

  const filteredExperiences = useMemo(() => {
    if (selectedFilter === 'all') return experiences;
    // Simple filtering - in real app, you'd check experience categories/tags
    return experiences;
  }, [experiences, selectedFilter]);

  if (!destination) {
    return (
      <View style={styles.container}>
        <Text>Destination not found</Text>
      </View>
    );
  }

  const renderRecommendationCard = ({ item }: { item: Experience }) => (
    <View style={styles.recommendationCard}>
      <Image
        source={{ uri: item.heroImage }}
        style={styles.recommendationImage}
        contentFit="cover"
      />
      <View style={styles.recommendationContent}>
        <Text style={styles.recommendationTitle}>{item.title}</Text>
        <Text style={styles.recommendationDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.recommendationActions}>
          <Pressable
            onPress={() => {
              router.push(`/(tabs)/explore/experiences/${item.id}`);
            }}>
            <Text style={styles.viewDetailsText}>View Details</Text>
          </Pressable>
          <Pressable style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  const renderDestinationCard = ({ item }: { item: Destination }) => (
    <Pressable
      style={styles.destinationCard}
      onPress={() => {
        router.push(`/(tabs)/explore/destinations/${item.id}`);
      }}>
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: item.heroImage || item.thumbnailImage }}
          style={styles.destinationImage}
          contentFit="cover"
        />
        <View style={styles.imageOverlay}>
          <Heart size={18} color={colors.white} />
        </View>
      </View>
      <View style={styles.destinationContent}>
        <Text style={styles.destinationTitle}>{item.name}</Text>
        <Text style={styles.destinationLocation}>
          {item.city}, {item.country}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <ScreenWithImage
      image={destination.heroImage || destination.thumbnailImage}
      header={{
        leftComponent: (
          <Pressable onPress={() => router.back()}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(0,0,0,0.3)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ color: colors.white }}>←</Text>
            </View>
          </Pressable>
        ),
      }}>
      <View style={styles.content}>
        <Text style={styles.title}>Dance to the Afrobeat sound</Text>

        <View style={styles.metadataRow}>
          <View style={styles.metadataItem}>
            <MapPin size={16} color={colors.textColors.default} />
            <Text style={styles.metadataText}>
              {destination.city}, {destination.country}
            </Text>
          </View>
          <View style={styles.metadataItem}>
            <Star size={16} color="#FFD700" fill="#FFD700" />
            <Text style={styles.metadataText}>4.8</Text>
          </View>
        </View>

        <View style={styles.categoriesRow}>
          {destination.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {tag === 'nightlife'
                  ? '🍹 Nightlife'
                  : tag === 'culture'
                    ? '🎭 Arts'
                    : tag === 'food'
                      ? '🍴 Food'
                      : tag}
              </Text>
            </View>
          ))}
        </View>

        <Text
          style={styles.description}
          numberOfLines={showMoreDescription ? undefined : 5}>
          {descriptionText}
        </Text>
        <Pressable
          style={styles.showMoreButton}
          onPress={() => setShowMoreDescription(!showMoreDescription)}>
          <Text style={styles.showMoreText}>
            {showMoreDescription ? 'Show Less' : 'Show More'}
          </Text>
        </Pressable>

        {/* Featured Itineraries */}
        {experiences.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Featured Itineraries"
              linkText="More →"
              linkTo={'/(tabs)/explore/itineraries' as any}
            />
            <Spacer size={16} vertical />
            <FlashList
              data={experiences.slice(0, 4)}
              renderItem={({ item }) => (
                <View style={{ width: 280, marginRight: 16 }}>
                  <View style={{ borderRadius: 16, overflow: 'hidden' }}>
                    <Image
                      source={{ uri: item.heroImage }}
                      style={{ width: 280, height: 160 }}
                      contentFit="cover"
                    />
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {/* Recommendations */}
        {filteredExperiences.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Recommendations" />
            <Spacer size={12} vertical />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}>
              {filters.map((filter) => (
                <Pressable
                  key={filter.id}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter.id
                      ? styles.filterButtonActive
                      : styles.filterButtonInactive,
                  ]}
                  onPress={() => setSelectedFilter(filter.id)}>
                  <Text
                    style={[
                      styles.filterText,
                      {
                        color:
                          selectedFilter === filter.id
                            ? colors.white
                            : colors.textColors.default,
                      },
                    ]}>
                    {filter.icon
                      ? `${filter.icon} ${filter.label}`
                      : filter.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Spacer size={16} vertical />
            <FlashList
              data={filteredExperiences}
              renderItem={renderRecommendationCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
            />
          </View>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Reviews ({reviews.length} reviews)
            </Text>
            <Spacer size={16} vertical />
            {reviews.slice(0, 3).map((review: Review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Image
                    source={{ uri: review.user.avatar }}
                    style={styles.reviewAvatar}
                    contentFit="cover"
                  />
                  <View style={styles.reviewUserInfo}>
                    <Text style={styles.reviewName}>{review.user.name}</Text>
                    <Text style={styles.reviewUsername}>
                      {review.user.username}
                    </Text>
                  </View>
                  <View style={styles.reviewRating}>
                    <StarRating rating={review.rating} readonly size={16} />
                  </View>
                </View>
                <Text style={styles.reviewDate}>{review.createdAt}</Text>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Similar Destinations */}
        {similarDestinations.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Similar Destinations"
              linkText="More →"
              linkTo={'/(tabs)/explore/destinations' as any}
            />
            <Spacer size={16} vertical />
            <FlashList
              data={similarDestinations}
              renderItem={renderDestinationCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}
        <Spacer size={120} vertical />
      </View>
    </ScreenWithImage>
  );
}
