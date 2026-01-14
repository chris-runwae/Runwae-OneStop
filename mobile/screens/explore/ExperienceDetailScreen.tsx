import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, Star, Building2, Car, Ticket, User, Utensils } from 'lucide-react-native';
import { Image } from 'expo-image';

import { ScreenWithImageGallery, Collapsible, Spacer, Text, StarRating } from '@/components';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';
import { exploreDummyData } from '@/stores/exploreStore';
import type { Experience, ItineraryItem, ExperienceInfo, Review } from '@/types/explore';

export default function ExperienceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const experience = useMemo(() => {
    return exploreDummyData.experiences.find((exp) => exp.id === id);
  }, [id]);

  const itineraryItems = useMemo(() => {
    if (!experience) return [];
    return exploreDummyData.itineraries
      .filter((it) => it.experienceId === experience.id)
      .sort((a, b) => a.order - b.order);
  }, [experience]);

  const experienceInfoItems = useMemo(() => {
    if (!experience) return [];
    return exploreDummyData.experienceInfo.filter(
      (info) => info.experienceId === experience.id
    );
  }, [experience]);

  const reviews = useMemo(() => {
    if (!experience) return [];
    return exploreDummyData.reviews.filter(
      (rev) => rev.experienceId === experience.id
    );
  }, [experience]);

  if (!experience) {
    return (
      <View style={styles.container}>
        <Text>Experience not found</Text>
      </View>
    );
  }

  const galleryImages = experience.galleryImages.map((url, index) => ({
    id: `${experience.id}-${index}`,
    url,
    urlHD: url,
  }));

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
      marginBottom: 24,
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
    sectionTitle: {
      ...textStyles.bold_20,
      fontSize: 20,
      color: colors.textColors.default,
      marginBottom: 16,
    },
    itineraryItem: {
      flexDirection: 'row',
      marginBottom: 20,
      gap: 12,
    },
    itineraryImage: {
      width: 80,
      height: 80,
      borderRadius: 12,
      backgroundColor: colors.borderColors.subtle,
    },
    itineraryContent: {
      flex: 1,
    },
    itineraryItemTitle: {
      ...textStyles.bold_20,
      fontSize: 16,
      color: colors.textColors.default,
      marginBottom: 4,
    },
    itineraryItemDescription: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      lineHeight: 20,
      color: colors.textColors.subtle,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
      gap: 12,
    },
    infoIcon: {
      marginTop: 2,
    },
    infoContent: {
      flex: 1,
    },
    infoTitle: {
      ...textStyles.bold_20,
      fontSize: 15,
      color: colors.textColors.default,
      marginBottom: 4,
    },
    infoText: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      lineHeight: 20,
      color: colors.textColors.subtle,
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
    socialProof: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 24,
    },
    socialProofAvatars: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    socialProofText: {
      ...textStyles.subtitle_Regular,
      fontSize: 13,
      color: colors.textColors.subtle,
    },
    avatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: colors.backgroundColors.default,
      marginLeft: -8,
    },
  });

  const getInfoIcon = (type: string) => {
    switch (type) {
      case 'guest_requirements':
        return <User size={20} color={colors.textColors.default} />;
      case 'what_to_bring':
        return <Ticket size={20} color={colors.textColors.default} />;
      case 'dining':
        return <Utensils size={20} color={colors.textColors.default} />;
      default:
        return null;
    }
  };

  const getInfoTitle = (type: string) => {
    switch (type) {
      case 'guest_requirements':
        return 'Guest Requirements';
      case 'what_to_bring':
        return 'What to Bring';
      case 'dining':
        return 'Dining Experience';
      case 'entertainment':
        return 'Entertainment';
      case 'cancellation_policy':
        return 'Cancellation Policy';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  return (
    <ScreenWithImageGallery
      images={galleryImages}
      header={{
        leftComponent: (
          <Pressable onPress={() => router.back()}>
            <View
              style={[
                styles.container,
                {
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}>
              <Text style={{ color: colors.white }}>←</Text>
            </View>
          </Pressable>
        ),
      }}>
      <View style={styles.content}>
        <Text style={styles.title}>{experience.title}</Text>

        <View style={styles.metadataRow}>
          <View style={styles.metadataItem}>
            <MapPin size={16} color={colors.textColors.default} />
            <Text style={styles.metadataText}>{experience.location}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Star size={16} color="#FFD700" fill="#FFD700" />
            <Text style={styles.metadataText}>{experience.rating}</Text>
          </View>
        </View>

        {experience.subtitle && (
          <Text style={[styles.description, { marginBottom: 12 }]}>
            {experience.subtitle}
          </Text>
        )}

        <Text style={styles.description}>{experience.description}</Text>

        {experience.categories && experience.categories.length > 0 && (
          <View style={styles.categoriesRow}>
            {experience.categories.map((category) => (
              <View key={category} style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Social Proof */}
        <View style={styles.socialProof}>
          <View style={styles.socialProofAvatars}>
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
              style={styles.avatar}
              contentFit="cover"
            />
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
              style={styles.avatar}
              contentFit="cover"
            />
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/women/28.jpg' }}
              style={styles.avatar}
              contentFit="cover"
            />
          </View>
          <Text style={styles.socialProofText}>added to their trip</Text>
        </View>

        {/* Itinerary Section */}
        {itineraryItems.length > 0 && (
          <View style={styles.section}>
            <Collapsible title="Itinerary" defaultOpen={true}>
              {itineraryItems.map((item: ItineraryItem) => (
                <View key={item.order} style={styles.itineraryItem}>
                  {item.image && (
                    <Image
                      source={{ uri: item.image }}
                      style={styles.itineraryImage}
                      contentFit="cover"
                    />
                  )}
                  <View style={styles.itineraryContent}>
                    <Text style={styles.itineraryItemTitle}>{item.title}</Text>
                    <Text style={styles.itineraryItemDescription}>
                      {item.description}
                    </Text>
                  </View>
                </View>
              ))}
            </Collapsible>
          </View>
        )}

        {/* What to Know Section */}
        {experienceInfoItems.length > 0 && (
          <View style={styles.section}>
            <Collapsible title="What to Know" defaultOpen={false}>
              {experienceInfoItems.map((info: ExperienceInfo, index) => (
                <View key={index} style={styles.infoItem}>
                  <View style={styles.infoIcon}>{getInfoIcon(info.type)}</View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>
                      {getInfoTitle(info.type)}
                    </Text>
                    <Text style={styles.infoText}>{info.content}</Text>
                  </View>
                </View>
              ))}
            </Collapsible>
          </View>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Reviews ({experience.reviewCount} reviews)
            </Text>
            {reviews.map((review: Review) => (
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
        <Spacer size={120} vertical />
      </View>
    </ScreenWithImageGallery>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
