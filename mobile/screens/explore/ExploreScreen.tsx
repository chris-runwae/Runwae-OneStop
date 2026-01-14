import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  useColorScheme,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Search, Filter, Heart } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';

import { ScreenContainer, SectionHeader, Spacer, Text } from '@/components';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';
import { getSupabaseClient } from '@/lib/supabase';

type Category = 'all' | 'romantic-getaway' | 'sports' | 'relax';

interface TableExists {
  featured_itineraries: boolean;
  featured_events: boolean;
  experience_highlights: boolean;
  popular_destinations: boolean;
}

export default function ExploreScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { getToken } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [tableExists, setTableExists] = useState<TableExists>({
    featured_itineraries: false,
    featured_events: false,
    experience_highlights: false,
    popular_destinations: false,
  });
  const [loading, setLoading] = useState(true);

  const [featuredItineraries, setFeaturedItineraries] = useState<any[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [experienceHighlights, setExperienceHighlights] = useState<any[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<any[]>([]);

  const categories = [
    { id: 'all' as Category, label: 'All', emoji: '' },
    {
      id: 'romantic-getaway' as Category,
      label: 'Romantic Getaway',
      emoji: '❤️',
    },
    { id: 'sports' as Category, label: 'Sports', emoji: '🏆' },
    { id: 'relax' as Category, label: 'Relax', emoji: '🧘' },
  ];

  // Check table existence and fetch data
  useEffect(() => {
    const checkTablesAndFetch = async () => {
      setLoading(true);
      try {
        const supabase = await getSupabaseClient(getToken);

        // Check each table and fetch data if it exists
        const tables: (keyof TableExists)[] = [
          'featured_itineraries',
          'featured_events',
          'experience_highlights',
          'popular_destinations',
        ];

        const exists: TableExists = {
          featured_itineraries: false,
          featured_events: false,
          experience_highlights: false,
          popular_destinations: false,
        };

        // Check and fetch for each table
        for (const table of tables) {
          try {
            const { data, error } = await supabase
              .from(table)
              .select('*')
              .limit(10);

            if (!error && data) {
              exists[table] = true;

              // Set data based on table
              switch (table) {
                case 'featured_itineraries':
                  setFeaturedItineraries(data || []);
                  break;
                case 'featured_events':
                  setFeaturedEvents(data || []);
                  break;
                case 'experience_highlights':
                  setExperienceHighlights(data || []);
                  break;
                case 'popular_destinations':
                  setPopularDestinations(data || []);
                  break;
              }
            }
          } catch (err) {
            // Table doesn't exist or error, continue
            console.log(`Table ${table} does not exist or error:`, err);
          }
        }

        setTableExists(exists);
      } catch (error) {
        console.error('Error checking tables:', error);
      } finally {
        setLoading(false);
      }
    };

    checkTablesAndFetch();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColors.default,
    },
    contentContainer: {
      paddingHorizontal: 16,
      paddingBottom: 32,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    searchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.borderColors.subtle,
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 48,
      gap: 12,
    },
    searchInput: {
      flex: 1,
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      color: colors.textColors.default,
    },
    filterButton: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.borderColors.subtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    categoriesContainer: {
      marginBottom: 24,
    },
    categoryButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginRight: 8,
      borderWidth: 1,
    },
    categoryButtonActive: {
      backgroundColor: colors.primaryColors.default,
      borderColor: colors.primaryColors.default,
    },
    categoryButtonInactive: {
      backgroundColor: 'transparent',
      borderColor: colors.borderColors.subtle,
    },
    categoryText: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
    },
    sectionContainer: {
      marginBottom: 32,
    },
    itineraryCard: {
      width: 300,
      marginRight: 16,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: colors.backgroundColors.subtle,
    },
    itineraryImage: {
      width: '100%',
      height: 200,
    },
    itineraryContent: {
      padding: 12,
    },
    itineraryTitle: {
      ...textStyles.bold_20,
      fontSize: 16,
      marginBottom: 4,
      color: colors.textColors.default,
    },
    itineraryMeta: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.textColors.subtle,
    },
    eventCard: {
      flexDirection: 'row',
      backgroundColor: colors.backgroundColors.subtle,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
    },
    eventImage: {
      width: 120,
      height: 120,
    },
    eventContent: {
      flex: 1,
      padding: 12,
      justifyContent: 'space-between',
    },
    eventTitle: {
      ...textStyles.bold_20,
      fontSize: 16,
      marginBottom: 4,
      color: colors.textColors.default,
    },
    eventLocation: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.textColors.subtle,
      marginBottom: 4,
    },
    eventDate: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.textColors.subtle,
    },
    eventTag: {
      alignSelf: 'flex-start',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 8,
      marginTop: 4,
    },
    highlightCard: {
      width: 320,
      marginRight: 16,
      backgroundColor: colors.backgroundColors.subtle,
      borderRadius: 16,
      overflow: 'hidden',
    },
    highlightImage: {
      width: '100%',
      height: 200,
    },
    highlightContent: {
      padding: 16,
    },
    highlightLocation: {
      ...textStyles.subtitle_Regular,
      fontSize: 12,
      color: colors.textColors.subtle,
      marginBottom: 4,
    },
    highlightTitle: {
      ...textStyles.bold_20,
      fontSize: 18,
      marginBottom: 8,
      color: colors.textColors.default,
    },
    highlightDescription: {
      ...textStyles.subtitle_Regular,
      fontSize: 13,
      color: colors.textColors.subtle,
      marginBottom: 12,
      lineHeight: 18,
    },
    highlightPrice: {
      ...textStyles.bold_20,
      fontSize: 16,
      color: colors.textColors.default,
      marginBottom: 12,
    },
    highlightButton: {
      backgroundColor: colors.primaryColors.default,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    highlightButtonText: {
      ...textStyles.bold_20,
      fontSize: 14,
      color: colors.white,
    },
    destinationCard: {
      width: 280,
      marginRight: 16,
      borderRadius: 16,
      overflow: 'hidden',
    },
    destinationImage: {
      width: '100%',
      height: 200,
    },
    destinationContent: {
      padding: 12,
      backgroundColor: colors.backgroundColors.subtle,
    },
    destinationTitle: {
      ...textStyles.bold_20,
      fontSize: 16,
      marginBottom: 4,
      color: colors.textColors.default,
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
  });

  const renderItineraryCard = ({ item }: { item: any }) => (
    <Pressable
      style={styles.itineraryCard}
      onPress={() => {
        // Navigate to itinerary detail
        console.log('Navigate to itinerary:', item.id);
      }}>
      <View style={{ position: 'relative' }}>
        <Image
          source={{
            uri:
              item.image_url ||
              item.cover_image ||
              'https://via.placeholder.com/300x200',
          }}
          style={styles.itineraryImage}
          contentFit="cover"
        />
        <View style={styles.imageOverlay}>
          <Heart size={18} color={colors.white} />
        </View>
      </View>
      <View style={styles.itineraryContent}>
        <Text style={styles.itineraryTitle}>{item.title || 'Itinerary'}</Text>
        <Text style={styles.itineraryMeta}>
          {item.activity_count || 0} activities • {item.duration_days || 0} days
        </Text>
      </View>
    </Pressable>
  );

  const renderEventCard = ({ item }: { item: any }) => (
    <Pressable
      style={styles.eventCard}
      onPress={() => {
        // Navigate to event detail
        console.log('Navigate to event:', item.id);
      }}>
      <Image
        source={{
          uri:
            item.image_url ||
            item.cover_image ||
            'https://via.placeholder.com/120x120',
        }}
        style={styles.eventImage}
        contentFit="cover"
      />
      <View style={styles.eventContent}>
        <View>
          <Text style={styles.eventTitle}>
            {item.title || item.name || 'Event'}
          </Text>
          <Text style={styles.eventLocation}>
            {item.location || 'Location'}
          </Text>
          <Text style={styles.eventDate}>
            {item.date || item.event_date || 'Date'}{' '}
            {item.time ? `| ${item.time}` : ''}
          </Text>
          {item.category && (
            <View
              style={[
                styles.eventTag,
                {
                  backgroundColor:
                    item.category === 'MUSIC FEST'
                      ? '#10B981'
                      : item.category === 'CULTURAL'
                        ? '#A855F7'
                        : item.category === 'FOOD'
                          ? '#3B82F6'
                          : colors.primaryColors.background,
                },
              ]}>
              <Text
                style={[
                  styles.categoryText,
                  { fontSize: 10, color: colors.textColors.default },
                ]}>
                {item.category}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );

  const renderHighlightCard = ({ item }: { item: any }) => (
    <Pressable
      style={styles.highlightCard}
      onPress={() => {
        // Navigate to highlight detail
        console.log('Navigate to highlight:', item.id);
      }}>
      <Image
        source={{
          uri:
            item.image_url ||
            item.cover_image ||
            'https://via.placeholder.com/320x200',
        }}
        style={styles.highlightImage}
        contentFit="cover"
      />
      <View style={styles.highlightContent}>
        <Text style={styles.highlightLocation}>
          {item.location || 'Location'}
        </Text>
        <Text style={styles.highlightTitle}>
          {item.title || item.name || 'Experience'}
        </Text>
        <Text style={styles.highlightDescription} numberOfLines={3}>
          {item.description || 'Experience description...'}
        </Text>
        <Text style={styles.highlightPrice}>
          from ${item.price || item.starting_price || '0'}
        </Text>
        <Pressable
          style={styles.highlightButton}
          onPress={(e) => {
            e.stopPropagation();
            // Add to trip logic
            console.log('Add to trip:', item.id);
          }}>
          <Text style={styles.highlightButtonText}>Add to trip</Text>
        </Pressable>
      </View>
    </Pressable>
  );

  const renderDestinationCard = ({ item }: { item: any }) => (
    <Pressable
      style={styles.destinationCard}
      onPress={() => {
        // Navigate to destination detail
        console.log('Navigate to destination:', item.id);
      }}>
      <Image
        source={{
          uri:
            item.image_url ||
            item.cover_image ||
            'https://via.placeholder.com/280x200',
        }}
        style={styles.destinationImage}
        contentFit="cover"
      />
      <View style={styles.destinationContent}>
        <Text style={styles.destinationTitle}>
          {item.title || item.name || 'Destination'}
        </Text>
        <Text style={styles.destinationLocation}>
          {item.location || item.city || 'Location'}
        </Text>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <ScreenContainer header={{ title: 'Explore' }}>
        <View
          style={[
            styles.container,
            { alignItems: 'center', justifyContent: 'center', flex: 1 },
          ]}>
          <ActivityIndicator
            size="large"
            color={colors.primaryColors.default}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer header={{ title: 'Explore' }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={colors.textColors.subtle} />
            <Text
              style={styles.searchInput}
              onPress={() => {
                // Handle search
                console.log('Search pressed');
              }}>
              Search...
            </Text>
          </View>
          <Pressable
            style={styles.filterButton}
            onPress={() => {
              // Handle filter
              console.log('Filter pressed');
            }}>
            <Filter size={20} color={colors.textColors.default} />
          </Pressable>
        </View>

        {/* Category Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id
                  ? styles.categoryButtonActive
                  : styles.categoryButtonInactive,
              ]}
              onPress={() => setSelectedCategory(category.id)}>
              <Text
                style={[
                  styles.categoryText,
                  {
                    color:
                      selectedCategory === category.id
                        ? colors.white
                        : colors.textColors.default,
                  },
                ]}>
                {category.emoji} {category.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Featured Itineraries */}
        {tableExists.featured_itineraries && (
          <View style={styles.sectionContainer}>
            <SectionHeader
              title="Featured Itineraries"
              linkText="More →"
              linkTo={'/explore/itineraries' as any}
            />
            <Spacer size={16} vertical />
            {featuredItineraries.length > 0 ? (
              <FlashList
                data={featuredItineraries}
                renderItem={renderItineraryCard}
                keyExtractor={(item) =>
                  item.id?.toString() || Math.random().toString()
                }
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            ) : (
              <Text style={{ color: colors.textColors.subtle }}>
                No itineraries available
              </Text>
            )}
          </View>
        )}

        {/* Featured Events */}
        {tableExists.featured_events && (
          <View style={styles.sectionContainer}>
            <SectionHeader
              title="Featured Events"
              linkText="More →"
              linkTo={'/explore/events' as any}
            />
            <Spacer size={16} vertical />
            {featuredEvents.length > 0 ? (
              <FlatList
                data={featuredEvents}
                renderItem={renderEventCard}
                keyExtractor={(item) =>
                  item.id?.toString() || Math.random().toString()
                }
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={{ color: colors.textColors.subtle }}>
                    No events available
                  </Text>
                }
              />
            ) : (
              <Text style={{ color: colors.textColors.subtle }}>
                No events available
              </Text>
            )}
          </View>
        )}

        {/* Experience Highlights */}
        {tableExists.experience_highlights && (
          <View style={styles.sectionContainer}>
            <SectionHeader
              title="Experience Highlights"
              linkText="More →"
              linkTo={'/explore/experiences' as any}
            />
            <Spacer size={16} vertical />
            {experienceHighlights.length > 0 ? (
              <FlashList
                data={experienceHighlights}
                renderItem={renderHighlightCard}
                keyExtractor={(item) =>
                  item.id?.toString() || Math.random().toString()
                }
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            ) : (
              <Text style={{ color: colors.textColors.subtle }}>
                No highlights available
              </Text>
            )}
          </View>
        )}

        {/* Popular Destinations */}
        {tableExists.popular_destinations && (
          <View style={styles.sectionContainer}>
            <SectionHeader
              title="Popular Destinations"
              linkText="More →"
              linkTo={'/explore/destinations' as any}
            />
            <Spacer size={16} vertical />
            {popularDestinations.length > 0 ? (
              <FlashList
                data={popularDestinations}
                renderItem={renderDestinationCard}
                keyExtractor={(item) =>
                  item.id?.toString() || Math.random().toString()
                }
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            ) : (
              <Text style={{ color: colors.textColors.subtle }}>
                No destinations available
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
