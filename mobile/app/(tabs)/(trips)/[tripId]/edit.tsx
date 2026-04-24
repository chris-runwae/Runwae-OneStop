import { useTheme } from '@react-navigation/native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Camera, MapPin } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DateRange from '@/components/containers/DateRange';
import { Colors } from '@/constants/theme';
import { useTrips } from '@/context/TripsContext';
import { Ionicons } from '@expo/vector-icons';

import DateModal from '@/components/trips/edit/DateModal';
import DestinationModal from '@/components/trips/edit/DestinationModal';
import EditTripField from '@/components/trips/edit/EditTripField';

export default function EditTripScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { dark } = useTheme();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    activeTrip,
    updateTrip,
    updateTripDetails,
    updateDestination,
    loadTrip,
  } = useTrips();

  // Basic trip info state
  const isCorrectTrip = activeTrip?.id === tripId;
  const [name, setName] = useState(
    isCorrectTrip ? (activeTrip?.name ?? '') : ''
  );
  const [description, setDescription] = useState(
    isCorrectTrip ? (activeTrip?.description ?? '') : ''
  );
  const [coverImage, setCoverImage] = useState<string | null>(
    isCorrectTrip ? (activeTrip?.cover_image_url ?? null) : null
  );

  // Destination state
  const [destinationLabel, setDestinationLabel] = useState(
    isCorrectTrip ? (activeTrip?.destination_label ?? '') : ''
  );
  const [destinationPlaceId, setDestinationPlaceId] = useState(
    isCorrectTrip ? (activeTrip?.destination_place_id ?? '') : ''
  );
  const [destinationAddress, setDestinationAddress] = useState(
    isCorrectTrip ? (activeTrip?.destination_address ?? '') : ''
  );

  // Date state
  const [startDate, setStartDate] = useState(
    isCorrectTrip ? (activeTrip?.trip_details?.start_date ?? '') : ''
  );
  const [endDate, setEndDate] = useState(
    isCorrectTrip ? (activeTrip?.trip_details?.end_date ?? '') : ''
  );

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isDestinationModalVisible, setIsDestinationModalVisible] =
    useState(false);
  const [isDateModalVisible, setIsDateModalVisible] = useState(false);

  // Initial load
  useEffect(() => {
    if (tripId && activeTrip?.id !== tripId) {
      loadTrip(tripId);
    }
  }, [tripId]);

  // Sync state when activeTrip updates
  useEffect(() => {
    if (activeTrip?.id === tripId) {
      setName(activeTrip.name ?? '');
      setDescription(activeTrip.description ?? '');
      setCoverImage(activeTrip.cover_image_url ?? null);
      setDestinationLabel(activeTrip.destination_label ?? '');
      setDestinationPlaceId(activeTrip.destination_place_id ?? '');
      setDestinationAddress(activeTrip.destination_address ?? '');
      setStartDate(activeTrip.trip_details?.start_date ?? '');
      setEndDate(activeTrip.trip_details?.end_date ?? '');
    }
  }, [activeTrip]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'We need access to your photos to change the cover image.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Trip name cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      const results = await Promise.all([
        updateTrip(tripId!, {
          name: name.trim(),
          description: description.trim(),
          cover_image_url: coverImage,
        }),
        updateDestination(tripId!, {
          destination_label: destinationLabel,
          destination_place_id: destinationPlaceId,
          destination_address: destinationAddress,
        }),
        updateTripDetails(tripId!, {
          start_date: startDate || null,
          end_date: endDate || startDate || null,
        }),
      ]);

      const err = results.find((r) => r?.error)?.error;
      if (err) {
        Alert.alert('Sync Error', 'Failed to save some changes.');
      } else {
        router.back();
      }
    } catch (err: any) {
      Alert.alert(
        'Save Failed',
        err.message || 'An unexpected error occurred.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.backgroundColors.default },
      ]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}>
          <Text
            style={[
              styles.headerButtonLabel,
              { color: dark ? '#fff' : '#000' },
            ]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: dark ? '#fff' : '#000' }]}>
          Edit Trip
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          style={styles.headerButton}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#FF1F8C" />
          ) : (
            <Text
              style={[
                styles.headerButtonLabel,
                { color: '#FF1F8C', fontWeight: 'bold' },
              ]}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <TouchableOpacity
          onPress={pickImage}
          activeOpacity={0.9}
          style={styles.imageContainer}>
          <Image
            source={
              coverImage
                ? { uri: coverImage }
                : require('@/assets/images/trip-empty-state.png')
            }
            style={styles.coverImage}
            contentFit="cover"
          />
          <View style={styles.imageOverlay}>
            <View style={styles.cameraIcon}>
              <Camera size={22} color="#fff" strokeWidth={2.5} />
            </View>
            <Text style={styles.changePhotoText}>Change Cover Photo</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.form}>
          {/* Editable Fields */}
          <EditTripField
            label="Trip Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Summer in Tokyo"
          />

          <EditTripField
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="What's the vibe? ✨"
            multiline
            numberOfLines={4}
          />

          {/* Interactive Selection Rows */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.infoRow}
              onPress={() => setIsDestinationModalVisible(true)}>
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: dark ? '#131313' : '#f8f9fa' },
                ]}>
                <MapPin size={18} color={dark ? '#fff' : '#6b7280'} />
              </View>
              <View style={styles.infoContent}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: dark ? '#9ca3af' : '#6b7280' },
                  ]}>
                  Destination
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: dark ? '#fff' : '#111827' },
                  ]}>
                  {destinationLabel || 'Select a destination'}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={dark ? '#4b5563' : '#9ca3af'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.infoRow, { borderBottomWidth: 0 }]}
              onPress={() => setIsDateModalVisible(true)}>
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: dark ? '#131313' : '#f8f9fa' },
                ]}>
                <Calendar size={18} color={dark ? '#fff' : '#6b7280'} />
              </View>
              <View style={styles.infoContent}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: dark ? '#9ca3af' : '#6b7280' },
                  ]}>
                  Dates
                </Text>
                <DateRange
                  startDate={startDate}
                  endDate={endDate}
                  fontSize={15}
                />
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={dark ? '#4b5563' : '#9ca3af'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <DestinationModal
        visible={isDestinationModalVisible}
        onClose={() => setIsDestinationModalVisible(false)}
        initialQuery={destinationLabel}
        onSelect={(place) => {
          setDestinationLabel(place.displayName);
          setDestinationPlaceId(place.placeId);
          setDestinationAddress(place.formattedAddress || '');
          setIsDestinationModalVisible(false);
        }}
      />

      <DateModal
        visible={isDateModalVisible}
        onClose={() => setIsDateModalVisible(false)}
        initialStartDate={startDate}
        initialEndDate={endDate}
        onSelect={(start, end) => {
          setStartDate(start);
          setEndDate(end);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#33333311',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerButton: {
    minWidth: 60,
  },
  headerButtonLabel: {
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    height: 220,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  coverImage: {
    flex: 1,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  changePhotoText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  form: {
    padding: 24,
  },
  section: {
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: '#33333311',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
});
