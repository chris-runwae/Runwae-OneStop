// screens/events/EventDetailScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { EventsService } from '@/services/events.service';
import type { EventWithAttendance, EventItineraryItem } from '@/types/events';
import { useUser } from '@clerk/clerk-expo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 300;

export default function EventDetailScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { user } = useUser();
  const [event, setEvent] = useState<EventWithAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  // Parallax header animation
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [0, -HEADER_HEIGHT / 2],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [-HEADER_HEIGHT, 0],
      [2, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  // Sticky header background opacity
  const stickyHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [HEADER_HEIGHT - 100, HEADER_HEIGHT],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const data = await EventsService.getEventById(eventId, user?.id);
      setEvent(data);
    } catch (error) {
      console.error('Failed to fetch event:', error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendance = async () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to attend events');
      return;
    }

    try {
      setAttendanceLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const newStatus = event?.is_attending ? 'cancelled' : 'going';
      await EventsService.updateAttendance(eventId, user.id, newStatus);

      // Optimistic update
      setEvent(prev => prev ? {
        ...prev,
        is_attending: !prev.is_attending,
      } : null);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to update attendance:', error);
      Alert.alert('Error', 'Failed to update attendance');
      // Revert optimistic update
      fetchEvent();
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleAddToTrip = () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to add events to trips');
      return;
    }

    router.push({
      pathname: '/events/add-to-trip',
      params: { eventId },
    });
  };

  const handleShare = async () => {
    try {
      const url = `runwae://events/${eventId}`;
      // Fallback for non-app users
      const webUrl = `https://runwae.com/events/${eventId}`;

      await Share.share({
        message: `Check out this event: ${event?.name}\n\n${webUrl}`,
        url: webUrl,
      });

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleShowQR = () => {
    router.push({
      pathname: '/events/qr',
      params: { eventId },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <Animated.View style={[styles.stickyHeader, stickyHeaderStyle]}>
        <Text style={styles.stickyHeaderTitle} numberOfLines={1}>
          {event.name}
        </Text>
      </Animated.View>

      {/* Header Buttons */}
      <View style={styles.headerButtons}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerButtonsRight}>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.headerButton}
          >
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShowQR}
            style={styles.headerButton}
          >
            <Ionicons name="qr-code-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image */}
        <Animated.View style={[styles.heroContainer, headerAnimatedStyle]}>
          {event.image_url ? (
            <Animated.Image
              source={{ uri: event.image_url }}
              style={styles.heroImage}
              sharedTransitionTag={`event-image-${event.id}`}
            />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Ionicons name="calendar-outline" size={64} color="#ccc" />
            </View>
          )}
          <View style={styles.heroOverlay} />
        </Animated.View>

        {/* Content */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.content}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {event.category.toUpperCase()}
            </Text>
          </View>

          {/* Event Title */}
          <Text style={styles.eventTitle}>{event.name}</Text>

          {/* Event Meta */}
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={18} color="#007AFF" />
            <Text style={styles.metaText}>
              {new Date(event.start_date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>

          {event.start_date !== event.end_date && (
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={18} color="#007AFF" />
              <Text style={styles.metaText}>
                Ends {new Date(event.end_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          )}

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={18} color="#007AFF" />
            <Text style={styles.metaText}>{event.location}</Text>
          </View>

          {event.current_attendees && (
            <View style={styles.metaRow}>
              <Ionicons name="people-outline" size={18} color="#007AFF" />
              <Text style={styles.metaText}>
                {event.current_attendees} people attending
              </Text>
            </View>
          )}

          {/* Organizer */}
          {event.organizer_name && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Organized by</Text>
              <Text style={styles.organizerName}>{event.organizer_name}</Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Event Itinerary */}
          {event.event_itinerary && event.event_itinerary.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Event Schedule</Text>
              {event.event_itinerary.map((item: EventItineraryItem, index: number) => (
                <View key={item.id} style={styles.itineraryItem}>
                  <View style={styles.itineraryTime}>
                    <Text style={styles.itineraryTimeText}>{item.time}</Text>
                  </View>
                  <View style={styles.itineraryContent}>
                    <Text style={styles.itineraryTitle}>{item.title}</Text>
                    {item.description && (
                      <Text style={styles.itineraryDescription}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Bottom Spacing for Sticky CTA */}
          <View style={{ height: 100 }} />
        </Animated.View>
      </Animated.ScrollView>

      {/* Sticky CTA Buttons */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity
          onPress={handleAddToTrip}
          style={styles.secondaryButton}
          disabled={!user}
        >
          <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
          <Text style={styles.secondaryButtonText}>Add to Trip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleAttendance}
          style={[
            styles.primaryButton,
            event.is_attending && styles.primaryButtonActive,
          ]}
          disabled={attendanceLoading || !user}
        >
          {attendanceLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons
                name={event.is_attending ? 'checkmark-circle' : 'ticket-outline'}
                size={20}
                color="#fff"
              />
              <Text style={styles.primaryButtonText}>
                {event.is_attending ? "You're Attending" : 'Attend Event'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
    paddingBottom: 12,
    paddingHorizontal: 16,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  stickyHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  headerButtons: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 20,
  },
  headerButtonsRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroContainer: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E5EA',
  },
  heroPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#007AFF',
    letterSpacing: 0.5,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    marginBottom: 16,
    lineHeight: 34,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  itineraryItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  itineraryTime: {
    width: 60,
    paddingTop: 2,
  },
  itineraryTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  itineraryContent: {
    flex: 1,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#E5E5EA',
  },
  itineraryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  itineraryDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#007AFF',
  },
  primaryButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#007AFF',
  },
  primaryButtonActive: {
    backgroundColor: '#34C759',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});