import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import { useTrips } from '@/context/TripsContext';
import { TripVisibility } from '@/hooks/useTripActions';
import { supabase } from '@/utils/supabase/client';
import { useTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { uploadGroupCoverImage } from '@/utils/supabase/storage';
import CreateStepHeader from './CreateStepHeader';

// ================================================================
// CreateTripDetails — Step 3 of 3
// ================================================================

export default function CreateTripDetails() {
  const { dark } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    destination_label: string;
    destination_place_id: string;
    destination_address: string;
    start_date: string;
    end_date: string;
  }>();

  const { createTrip, updateTripDetails, updateDestination, updateTrip } =
    useTrips();

  // Trip name — pre-filled from destination_label until user types
  const [tripName, setTripName] = useState(params.destination_label ?? '');
  const touchedName = useRef(false);

  // Visibility
  const [visibility, setVisibility] = useState<TripVisibility>('public');

  // Cover image
  const [coverUri, setCoverUri] = useState<string | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  // ----------------------------------------------------------------
  // Handlers
  // ----------------------------------------------------------------

  const handleNameChange = useCallback((text: string) => {
    touchedName.current = true;
    setTripName(text);
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'We need camera roll permissions to select a profile image.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setCoverUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'We need camera permissions to take a photo.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setCoverUri(result.assets[0].uri);
    }
  };

  const showImagePicker = () => {
    Alert.alert('Select Cover Image', 'Choose an option', [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Photo Library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleCreateTrip = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setInlineError(null);

    try {
      // Step 1: Create the trip (inserts groups row)
      const { groupId, error: createError } = await createTrip({
        name: tripName.trim() || (params.destination_label ?? 'My Trip'),
      });
      if (createError || !groupId) {
        setInlineError('Failed to create trip. Please try again.');
        console.error('Error creating trip: ', createError);
        setSubmitting(false);
        return;
      }

      // Step 2: Update trip details with dates and visibility
      const { error: detailsError } = await updateTripDetails(groupId, {
        start_date: params.start_date || null,
        end_date: params.end_date || null,
        visibility,
      });
      if (detailsError) {
        setInlineError(detailsError);
        setSubmitting(false);
        return;
      }

      // Step 3: Update destination fields
      const { error: destError } = await updateDestination(groupId, {
        destination_label: params.destination_label ?? '',
        destination_place_id: params.destination_place_id ?? undefined,
        destination_address: params.destination_address ?? undefined,
      });
      if (destError) {
        setInlineError(destError);
        setSubmitting(false);
        return;
      }

      // Step 4: Upload cover image if selected
      let coverImageUrl: string | undefined;
      if (coverUri) {
        try {
          coverImageUrl = await uploadGroupCoverImage(groupId, coverUri);
        } catch (error) {
          console.error('Error uploading cover image: ', error);
          Alert.alert(
            'Warning',
            'Failed to upload cover image. You can add it later.'
          );
        }
      }

      //Update trip with cover image url
      await updateTrip(groupId, { cover_image_url: coverImageUrl });

      // Step 5: Navigate to success screen
      router.push({
        pathname: '(tabs)/create-trip/success' as any,
        params: {
          tripId: groupId,
          tripName: tripName.trim() || (params.destination_label ?? 'My Trip'),
          destination_label: params.destination_label ?? '',
        },
      });
    } catch (err: any) {
      setInlineError(err?.message ?? 'Something went wrong. Please try again.');
      console.error('Error creating trip: ', err);
    } finally {
      setSubmitting(false);
    }
  }, [
    submitting,
    tripName,
    visibility,
    coverUri,
    params,
    createTrip,
    updateTripDetails,
    updateDestination,
    updateTrip,
  ]);

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------

  return (
    <AppSafeAreaView>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <CreateStepHeader currentStep={3} totalSteps={3} />

          <Text style={[styles.title, { color: dark ? '#ffffff' : '#111827' }]}>
            Name your trip
          </Text>
          <Text
            style={[styles.subtitle, { color: dark ? '#9ca3af' : '#6b7280' }]}>
            Give it a name and personalise it.
          </Text>

          {/* Trip name input */}
          <Text
            style={[
              styles.fieldLabel,
              { color: dark ? '#9ca3af' : '#6b7280' },
            ]}>
            Trip name
          </Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: dark ? '#1c1c1e' : '#f9fafb',
                borderColor: dark ? '#2c2c2e' : '#e5e7eb',
              },
            ]}>
            <TextInput
              style={[styles.input, { color: dark ? '#ffffff' : '#111827' }]}
              placeholder="e.g. Summer in Tokyo"
              placeholderTextColor={dark ? '#4b5563' : '#9ca3af'}
              value={tripName}
              onChangeText={handleNameChange}
              returnKeyType="done"
              maxLength={80}
            />
          </View>

          {/* Visibility toggle */}
          <Text
            style={[
              styles.fieldLabel,
              { color: dark ? '#9ca3af' : '#6b7280' },
            ]}>
            Visibility
          </Text>
          <View style={styles.visibilityRow}>
            <TouchableOpacity
              style={[
                styles.visibilityPill,
                {
                  backgroundColor:
                    visibility === 'private'
                      ? '#FF1F8C'
                      : dark
                        ? '#1c1c1e'
                        : '#f3f4f6',
                  borderColor:
                    visibility === 'private'
                      ? '#FF1F8C'
                      : dark
                        ? '#2c2c2e'
                        : '#e5e7eb',
                },
              ]}
              onPress={() => setVisibility('private')}>
              <Text
                style={[
                  styles.visibilityPillText,
                  {
                    color:
                      visibility === 'private'
                        ? '#ffffff'
                        : dark
                          ? '#9ca3af'
                          : '#6b7280',
                  },
                ]}>
                Private
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.visibilityPill,
                {
                  backgroundColor:
                    visibility === 'public'
                      ? '#FF1F8C'
                      : dark
                        ? '#1c1c1e'
                        : '#f3f4f6',
                  borderColor:
                    visibility === 'public'
                      ? '#FF1F8C'
                      : dark
                        ? '#2c2c2e'
                        : '#e5e7eb',
                },
              ]}
              onPress={() => setVisibility('public')}>
              <Text
                style={[
                  styles.visibilityPillText,
                  {
                    color:
                      visibility === 'public'
                        ? '#ffffff'
                        : dark
                          ? '#9ca3af'
                          : '#6b7280',
                  },
                ]}>
                Public
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cover image */}
          <Text
            style={[
              styles.fieldLabel,
              { color: dark ? '#9ca3af' : '#6b7280' },
            ]}>
            Cover image
          </Text>
          <TouchableOpacity
            style={[
              styles.coverImageArea,
              {
                backgroundColor: dark ? '#1c1c1e' : '#f9fafb',
                borderColor: dark ? '#2c2c2e' : '#e5e7eb',
              },
            ]}
            onPress={showImagePicker}
            activeOpacity={0.8}>
            {coverUri ? (
              <Image
                source={{ uri: coverUri }}
                style={styles.coverPreview}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Text
                  style={[
                    styles.coverPlaceholderIcon,
                    { color: dark ? '#4b5563' : '#d1d5db' },
                  ]}>
                  🖼
                </Text>
                <Text
                  style={[
                    styles.coverPlaceholderText,
                    { color: dark ? '#6b7280' : '#9ca3af' },
                  ]}>
                  Tap to add a cover image
                </Text>
                <Text
                  style={[
                    styles.coverPlaceholderHint,
                    { color: dark ? '#4b5563' : '#d1d5db' },
                  ]}>
                  Optional · 16:9 recommended
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Footer — create button */}
        <View
          style={[
            styles.footer,
            {
              borderTopColor: dark ? '#2c2c2e' : '#f3f4f6',
              marginBottom: insets.bottom + 16,
            },
          ]}>
          <TouchableOpacity
            style={[
              styles.createButton,
              submitting && styles.createButtonDisabled,
            ]}
            onPress={handleCreateTrip}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.createButtonText}>Create Trip</Text>
            )}
          </TouchableOpacity>

          {inlineError && <Text style={styles.inlineError}>{inlineError}</Text>}
        </View>
      </KeyboardAvoidingView>
    </AppSafeAreaView>
  );
}

// ================================================================
// Styles
// ================================================================

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },

  title: {
    fontSize: 26,
    fontFamily: 'BricolageGrotesque-Bold',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },

  // Text input
  inputWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 24,
  },
  input: {
    fontSize: 15,
    padding: 0,
  },

  // Visibility pills
  visibilityRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  visibilityPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visibilityPillText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Cover image
  coverImageArea: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    overflow: 'hidden',
    height: 160,
    marginBottom: 16,
  },
  coverPreview: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  coverPlaceholderIcon: {
    fontSize: 28,
  },
  coverPlaceholderText: {
    fontSize: 14,
    fontWeight: '500',
  },
  coverPlaceholderHint: {
    fontSize: 12,
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  createButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF1F8C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#fda0c9',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  inlineError: {
    color: '#ef4444',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
});
