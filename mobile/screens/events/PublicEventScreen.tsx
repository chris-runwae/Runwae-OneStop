// screens/events/PublicEventScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { EventsService } from '@/services/events.service';
import type { Event } from '@/types/events';
import { useUser } from '@clerk/clerk-expo';

/**
 * Public-facing event preview screen
 * - Accessible via deep link without authentication
 * - Shows event details in read-only mode
 * - Prompts non-users to download app
 * - Authenticated users can navigate to full event detail
 */
export default function PublicEventScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { user } = useUser();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      // Public endpoint - no auth required
      const data = await EventsService.getEventById(eventId);
      setEvent(data);
    } catch (error) {
      console.error('Failed to fetch event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadApp = () => {
    const appStoreUrl = Platform.select({
      ios: 'https://apps.apple.com/app/runwae/id123456789', // Replace with actual
      android: 'https://play.google.com/store/apps/details?id=com.runwae', // Replace with actual
    });

    if (appStoreUrl) {
      Linking.openURL(appStoreUrl);
    }
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          {event.image_url ? (
            <Animated.Image
              entering={FadeIn}
              source={{ uri: event.image_url }}
              style={styles.heroImage}
            />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Ionicons name="calendar-outline" size={64} color="#ccc" />
            </View>
          )}
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.heroGradient}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {event?.category?.toUpperCase()}
            </Text>
          </View>

          {/* Event Title */}
          <Text style={styles.eventTitle}>{event.name}</Text>

          {/* Event Meta */}
          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={20} color="#007AFF" />
              <Text style={styles.metaText}>
                {new Date(event.start_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={20} color="#007AFF" />
              <Text style={styles.metaText}>{event.location}</Text>
            </View>

            {event.current_attendees && (
              <View style={styles.metaRow}>
                <Ionicons name="people-outline" size={20} color="#007AFF" />
                <Text style={styles.metaText}>
                  {event.current_attendees} people attending
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Organizer */}
          {event.organizer_name && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Organized by</Text>
              <Text style={styles.organizerName}>{event.organizer_name}</Text>
            </View>
          )}

          {/* App Download CTA (for non-authenticated users) */}
          {!user && (
            <Animated.View entering={FadeIn.delay(300)} style={styles.ctaSection}>
              <LinearGradient
                colors={['#007AFF', '#0051D5']}
                style={styles.ctaCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="phone-portrait-outline" size={32} color="#fff" />
                <Text style={styles.ctaTitle}>Get Runwae to attend this event</Text>
                <Text style={styles.ctaSubtitle}>
                  Join thousands planning amazing trips together
                </Text>
                <TouchableOpacity onPress={handleDownloadApp} style={styles.downloadButton}>
                  <Text style={styles.downloadButtonText}>Download App</Text>
                  <Ionicons name="arrow-forward" size={20} color="#007AFF" />
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA (authenticated users) */}
      {user && (
        <View style={styles.bottomCTA}>
          <TouchableOpacity
            onPress={() => {
              // Navigate to full event detail screen
              // This assumes you're using Expo Router's tabs or stack
              Linking.openURL(`runwae://events/${eventId}`);
            }}
            style={styles.viewEventButton}
          >
            <Text style={styles.viewEventButtonText}>View Full Event Details</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
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
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    height: 300,
    position: 'relative',
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
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
    marginBottom: 20,
    lineHeight: 34,
  },
  metaContainer: {
    gap: 12,
    marginBottom: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  ctaSection: {
    marginTop: 32,
  },
  ctaCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginTop: 24,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  viewEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
  },
  viewEventButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});