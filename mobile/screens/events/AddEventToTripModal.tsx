// screens/events/AddEventToTripModal.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { EventsService } from '@/services/events.service';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-expo';
import type { Event } from '@/types/events';

interface Trip {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  destination: string;
  image_url?: string;
}

export default function AddEventToTripModal() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { user } = useUser();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const translateY = useSharedValue(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch event details
      const eventData = await EventsService.getEventById(eventId);
      setEvent(eventData);

      // Fetch user's trips
      const { data: tripsData, error } = await supabase
        .from('trips')
        .select('id, name, start_date, end_date, destination, image_url')
        .or(`created_by.eq.${user?.id},collaborators.cs.{${user?.id}}`)
        .order('start_date', { ascending: false });

      if (error) throw error;

      setTrips(tripsData || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      Alert.alert('Error', 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  // Generate available dates for selected trip
  const availableDates = useMemo(() => {
    if (!selectedTrip || !event) return [];

    const tripStart = new Date(selectedTrip.start_date);
    const tripEnd = new Date(selectedTrip.end_date);
    const eventDate = new Date(event.start_date);

    // Default to event date if within trip range
    const dates: string[] = [];
    const current = new Date(tripStart);

    while (current <= tripEnd) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }, [selectedTrip, event]);

  // Auto-select event date if it falls within trip
  useEffect(() => {
    if (selectedTrip && event && !selectedDate) {
      const eventDate = event.start_date.split('T')[0];
      if (availableDates.includes(eventDate)) {
        setSelectedDate(eventDate);
      } else if (availableDates.length > 0) {
        // Default to first day if event date not in range
        setSelectedDate(availableDates[0]);
      }
    }
  }, [selectedTrip, event, availableDates]);

  const handleSave = async () => {
    if (!selectedTrip || !selectedDate || !user) {
      Alert.alert('Error', 'Please select a trip and date');
      return;
    }

    try {
      setSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await EventsService.addEventToTrip({
        tripId: selectedTrip.id,
        eventId,
        date: selectedDate,
        userId: user.id,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Success',
        `Event added to ${selectedTrip.name}`,
        [
          {
            text: 'View Trip',
            onPress: () => {
              router.dismiss();
              router.push(`/trips/${selectedTrip.id}`);
            },
          },
          {
            text: 'Done',
            onPress: () => router.dismiss(),
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Failed to add event to trip:', error);
      Alert.alert('Error', 'Failed to add event to trip');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  const renderTripCard = useCallback(({ item }: { item: Trip }) => {
    const isSelected = selectedTrip?.id === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          setSelectedTrip(item);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        style={[styles.tripCard, isSelected && styles.tripCardSelected]}
      >
        {item.image_url ? (
          <Animated.Image
            source={{ uri: item.image_url }}
            style={styles.tripImage}
          />
        ) : (
          <View style={[styles.tripImage, styles.tripImagePlaceholder]}>
            <Ionicons name="airplane-outline" size={24} color="#ccc" />
          </View>
        )}

        <View style={styles.tripInfo}>
          <Text style={styles.tripName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.tripDestination} numberOfLines={1}>
            {item.destination}
          </Text>
          <Text style={styles.tripDates}>
            {new Date(item.start_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
            {' - '}
            {new Date(item.end_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>

        {isSelected && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  }, [selectedTrip]);

  const renderDateChip = useCallback((date: string) => {
    const isSelected = selectedDate === date;
    const dateObj = new Date(date);

    return (
      <TouchableOpacity
        key={date}
        onPress={() => {
          setSelectedDate(date);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        style={[styles.dateChip, isSelected && styles.dateChipSelected]}
      >
        <Text style={[styles.dateChipDay, isSelected && styles.dateChipTextSelected]}>
          {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
        </Text>
        <Text style={[styles.dateChipDate, isSelected && styles.dateChipTextSelected]}>
          {dateObj.getDate()}
        </Text>
      </TouchableOpacity>
    );
  }, [selectedDate]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => router.dismiss()}
        style={styles.backdrop}
      >
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
      </TouchableOpacity>

      {/* Modal Content */}
      <Animated.View
        entering={SlideInDown.springify().damping(15)}
        style={styles.modalContent}
      >
        {/* Handle Bar */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.dismiss()}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add to Trip</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!selectedTrip || !selectedDate || saving}
          >
            <Text
              style={[
                styles.saveButton,
                (!selectedTrip || !selectedDate || saving) && styles.saveButtonDisabled,
              ]}
            >
              {saving ? 'Adding...' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Event Preview */}
        {event && (
          <Animated.View entering={FadeIn.delay(100)} style={styles.eventPreview}>
            <Ionicons name="ticket-outline" size={20} color="#007AFF" />
            <Text style={styles.eventPreviewText} numberOfLines={1}>
              {event.name}
            </Text>
          </Animated.View>
        )}

        {/* Select Trip Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Trip</Text>
          {trips.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="airplane-outline" size={32} color="#ccc" />
              <Text style={styles.emptyStateText}>No trips yet</Text>
              <TouchableOpacity
                onPress={() => {
                  router.dismiss();
                  router.push('/trips/create');
                }}
                style={styles.createTripButton}
              >
                <Text style={styles.createTripButtonText}>Create a Trip</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={trips}
              renderItem={renderTripCard}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.tripsList}
            />
          )}
        </View>

        {/* Select Date Section */}
        {selectedTrip && availableDates.length > 0 && (
          <Animated.View entering={FadeIn.delay(200)} style={styles.section}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <FlatList
              horizontal
              data={availableDates}
              renderItem={({ item }) => renderDateChip(item)}
              keyExtractor={item => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.datesList}
            />
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D1D6',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  saveButtonDisabled: {
    color: '#C7C7CC',
  },
  eventPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
  },
  eventPreviewText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  tripsList: {
    gap: 12,
  },
  tripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tripCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  tripImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
  },
  tripImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tripName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  tripDestination: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  tripDates: {
    fontSize: 12,
    color: '#999',
  },
  checkmark: {
    marginLeft: 8,
  },
  datesList: {
    gap: 8,
  },
  dateChip: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 60,
  },
  dateChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dateChipDay: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  dateChipDate: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  dateChipTextSelected: {
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 16,
  },
  createTripButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createTripButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});