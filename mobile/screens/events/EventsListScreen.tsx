// screens/events/EventsListScreen.tsx

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { FlashList } from '@shopify/flash-list';

import { EventsService } from '@/services/events.service';
import type { Event, EventFilters, EventCategory } from '@/types/events';


const CATEGORIES: { label: string; value: EventCategory }[] = [
  { label: 'All', value: 'other' },
  { label: 'Concerts', value: 'concert' },
  { label: 'Festivals', value: 'festival' },
  { label: 'Sports', value: 'sports' },
  { label: 'Food & Drink', value: 'food' },
  { label: 'Art', value: 'art' },
  { label: 'Outdoor', value: 'outdoor' },
];

export default function EventsListScreen() {
  const { user } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<EventFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);

  const fetchEvents = useCallback(
    async (pageNum = 0, isRefresh = false) => {
      try {
        if (pageNum === 0) {
          isRefresh ? setRefreshing(true) : setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const result = await EventsService.getEvents(filters, pageNum);

        if (pageNum === 0) {
          setEvents(result.events);
        } else {
          setEvents(prev => [...prev, ...result.events]);
        }

        setHasMore(result.hasMore);
        setPage(pageNum);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        // TODO: Show toast/alert
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchEvents(0);
  }, [filters]);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    // Debounce would be ideal here in production
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, searchQuery: text || undefined }));
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleCategoryPress = useCallback((category: EventCategory | null) => {
    setSelectedCategory(category);
    setFilters(prev => ({
      ...prev,
      category: category === 'other' ? undefined : category,
    }));
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchEvents(page + 1);
    }
  }, [loadingMore, hasMore, page, fetchEvents]);

  const handleRefresh = useCallback(() => {
    fetchEvents(0, true);
  }, [fetchEvents]);

  const renderEventCard = useCallback(({ item, index }: { item: Event; index: number }) => {
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).springify()}
        style={styles.eventCardWrapper}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push(`/events/${item.id}`)}
          style={styles.eventCard}
        >
          {item.image_url && (
            <Animated.Image
              source={{ uri: item.image_url }}
              style={styles.eventImage}
              // sharedTransitionTag={`event-image-${item.id}`}
            />
          )}
          
          <View style={styles.eventContent}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventCategory}>{item?.category?.toUpperCase() ?? ''}</Text>
              <Text style={styles.eventDate}>
                {new Date(item.start_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>

            <Text style={styles.eventName} numberOfLines={2}>
              {item.name}
            </Text>

            <View style={styles.eventMeta}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.eventLocation} numberOfLines={1}>
                {item.location}
              </Text>
            </View>

            {item.current_attendees && (
              <View style={styles.attendeesRow}>
                <Ionicons name="people-outline" size={14} color="#007AFF" />
                <Text style={styles.attendeesText}>
                  {item.current_attendees} attending
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }, []);

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filters */}
      <FlashList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={item => item.value || ''}
        contentContainerStyle={styles.categoriesContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleCategoryPress(item.value === 'other' ? null : item.value)}
            style={[
              styles.categoryChip,
              (selectedCategory === item.value || (!selectedCategory && item.value === 'other')) &&
                styles.categoryChipActive,
            ]}
          >
            <Text
              style={[
                styles.categoryChipText,
                (selectedCategory === item.value || (!selectedCategory && item.value === 'other')) &&
                  styles.categoryChipTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No events found</Text>
      <Text style={styles.emptySubtitle}>
        Try adjusting your filters or check back later
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  if (loading && events.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#007AFF" />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  eventCardWrapper: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E5EA',
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#007AFF',
    letterSpacing: 0.5,
  },
  eventDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  eventName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  attendeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attendeesText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});