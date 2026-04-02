import { useTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Camera, MapPin, Calendar, Check } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { Colors } from '@/constants/theme';
import { useTrips } from '@/context/TripsContext';
import DateRange from '@/components/containers/DateRange';

export default function EditTripScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { dark } = useTheme();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { activeTrip, updateTrip, isLoading } = useTrips();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeTrip) {
      setName(activeTrip.name || '');
      setDescription(activeTrip.description || '');
      setCoverImage(activeTrip.cover_image_url || null);
    }
  }, [activeTrip]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to change the cover image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setCoverImage(uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a trip name.');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await updateTrip(tripId!, {
        name: name.trim(),
        description: description.trim(),
        cover_image_url: coverImage,
      });

      if (error) {
        Alert.alert('Error', error);
      } else {
        router.back();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !activeTrip) {
    return (
      <View style={[styles.centerContainer as ViewStyle, { backgroundColor: colors.backgroundColors.default }]}>
        <ActivityIndicator size="large" color="#FF1F8C" />
      </View>
    );
  }

  const containerStyle = [styles.container, { backgroundColor: colors.backgroundColors.default }];
  const headerTitleStyle = [styles.headerTitle, { color: dark ? '#fff' : '#111827' }];
  const inputStyle = [
    styles.input,
    { 
      color: dark ? '#fff' : '#111827',
      backgroundColor: dark ? '#1c1c1e' : '#f3f4f6',
    }
  ];
  const textAreaStyle = [inputStyle, styles.textArea];

  return (
    <View style={containerStyle}>
      {/* Header */}
      <View style={[styles.header as ViewStyle, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Text style={[styles.headerButtonLabel as TextStyle, { color: dark ? '#fff' : '#000' }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle as TextStyle}>Edit Trip</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.headerButton}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#FF1F8C" />
          ) : (
            <Text style={[styles.headerButtonLabel as TextStyle, { color: '#FF1F8C', fontWeight: '600' }]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cover Image Section */}
        <TouchableOpacity onPress={pickImage} activeOpacity={0.9} style={styles.imageContainer}>
          <Image
            source={coverImage ? { uri: coverImage } : require('@/assets/images/trip-empty-state.png')}
            style={styles.coverImage}
            contentFit="cover"
          />
          <View style={styles.imageOverlay}>
            <View style={styles.cameraIcon}>
              <Camera size={24} color="#fff" strokeWidth={2} />
            </View>
            <Text style={styles.changePhotoText}>Change Cover Photo</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.form}>
          {/* Trip Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: dark ? '#9ca3af' : '#6b7280' }]}>Trip Name</Text>
            <TextInput
              style={inputStyle}
              value={name}
              onChangeText={setName}
              placeholder="Summer Vacation 2024"
              placeholderTextColor={dark ? '#4b5563' : '#9ca3af'}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: dark ? '#9ca3af' : '#6b7280' }]}>Description</Text>
            <TextInput
              style={textAreaStyle}
              value={description}
              onChangeText={setDescription}
              placeholder="Write a short summary of your trip..."
              placeholderTextColor={dark ? '#4b5563' : '#9ca3af'}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Location (Read-only for now) */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MapPin size={20} color={dark ? '#9ca3af' : '#6b7280'} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: dark ? '#9ca3af' : '#6b7280' }]}>Destination</Text>
              <Text style={[styles.infoValue, { color: dark ? '#fff' : '#111827' }]}>
                {activeTrip.destination_label || 'No destination set'}
              </Text>
            </View>
          </View>

          {/* Dates (Read-only for now) */}
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.infoIcon}>
              <Calendar size={20} color={dark ? '#9ca3af' : '#6b7280'} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: dark ? '#9ca3af' : '#6b7280' }]}>Dates</Text>
              <DateRange
                startDate={activeTrip.trip_details?.start_date || ''}
                endDate={activeTrip.trip_details?.end_date || ''}
                fontSize={15}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    height: 200,
    width: '100%',
    position: 'relative',
  },
  coverImage: {
    flex: 1,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  changePhotoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
});
