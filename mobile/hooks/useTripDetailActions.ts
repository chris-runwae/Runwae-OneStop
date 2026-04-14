import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripsContext';
import { uploadGroupCoverImage } from '@/utils/supabase/storage';

export const useTripDetailActions = (tripId: string) => {
  const router = useRouter();
  const { user } = useAuth();
  const { activeTrip, updateTrip, joinTrip, leaveTrip, deleteTrip } = useTrips();
  const [isJoining, setIsJoining] = useState(false);

  const uploadTripCoverImage = async (imageUri: string) => {
    if (!activeTrip) return;
    try {
      const coverImageUrl = await uploadGroupCoverImage(
        activeTrip.id,
        imageUri
      );
      if (coverImageUrl) {
        await updateTrip(activeTrip.id, { cover_image_url: coverImageUrl });
      }
    } catch (err) {
      console.error('Failed to upload cover image:', err);
      Alert.alert(
        'Warning',
        'Failed to upload cover image. You can add it later.'
      );
    }
  };

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
      await uploadTripCoverImage(result.assets[0].uri);
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
      await uploadTripCoverImage(result.assets[0].uri);
    }
  };

  const showImagePicker = () => {
    Alert.alert('Select Profile Image', 'Choose an option', [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Photo Library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleJoinTrip = async () => {
    if (!activeTrip) return;
    setIsJoining(true);
    const { error: joinErr } = await joinTrip(activeTrip.id);
    setIsJoining(false);
    if (joinErr) {
      Alert.alert('Error', 'Failed to join trip: ' + joinErr);
    }
  };

  const handleLeaveTrip = async () => {
    if (!activeTrip) return;
    Alert.alert(
      'Leave Trip',
      'Are you sure you want to leave this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            const { error: leaveErr } = await leaveTrip(activeTrip.id);
            if (leaveErr) {
              Alert.alert('Error', 'Failed to leave trip: ' + leaveErr);
            } else {
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleDeleteTrip = async () => {
    if (!activeTrip) return;
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error: deleteErr } = await deleteTrip(activeTrip.id);
            if (deleteErr) {
              Alert.alert('Error', 'Failed to delete trip: ' + deleteErr);
            } else {
              router.back();
            }
          },
        },
      ]
    );
  };

  return {
    isJoining,
    handleJoinTrip,
    handleLeaveTrip,
    handleDeleteTrip,
    showImagePicker,
  };
};
