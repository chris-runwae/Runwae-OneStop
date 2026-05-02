import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";

import { useTrips } from "@/context/TripsContext";
import { api } from "@runwae/convex/convex/_generated/api";
import { uploadImageFromUri } from "@/lib/uploadImage";

export const useTripDetailActions = (_tripId: string) => {
  const router = useRouter();
  const { activeTrip, updateTrip, joinTrip, leaveTrip, deleteTrip } = useTrips();
  const [isJoining, setIsJoining] = useState(false);

  const generateUrlMut = useMutation(api.users.generateImageUploadUrl);
  const resolveUrlMut = useMutation(api.users.resolveStorageUrl);

  const uploadTripCoverImage = async (imageUri: string) => {
    if (!activeTrip) return;
    try {
      const coverImageUrl = await uploadImageFromUri(imageUri, {
        generateUrl: () => generateUrlMut(),
        resolveUrl: (args) => resolveUrlMut(args),
      });
      await updateTrip(activeTrip._id as unknown as string, {
        coverImageUrl,
      });
    } catch (err) {
      console.error("Failed to upload cover image:", err);
      Alert.alert(
        "Warning",
        "Failed to upload cover image. You can add it later.",
      );
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need camera roll permissions to select a profile image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
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
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need camera permissions to take a photo.",
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
    Alert.alert("Select Profile Image", "Choose an option", [
      { text: "Camera", onPress: takePhoto },
      { text: "Photo Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // Mobile join flow now uses join codes; surfacing the join CTA on the
  // trip detail page when the trip is public-but-the-viewer-isn't-a-member
  // is wired up to `joinByCode` via the share-link landing page rather
  // than from the detail screen.
  const handleJoinTrip = async () => {
    if (!activeTrip?.joinCode) {
      Alert.alert("Cannot join", "This trip does not have an open join code.");
      return;
    }
    setIsJoining(true);
    try {
      await joinTrip(activeTrip.joinCode);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to join trip";
      Alert.alert("Error", msg);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveTrip = async () => {
    if (!activeTrip) return;
    Alert.alert("Leave Trip", "Are you sure you want to leave this trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          const { error: leaveErr } = await leaveTrip(
            activeTrip._id as unknown as string,
          );
          if (leaveErr) {
            Alert.alert("Error", "Failed to leave trip: " + leaveErr);
          } else {
            router.back();
          }
        },
      },
    ]);
  };

  const handleDeleteTrip = async () => {
    if (!activeTrip) return;
    Alert.alert(
      "Delete Trip",
      "Are you sure you want to delete this trip? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error: deleteErr } = await deleteTrip(
              activeTrip._id as unknown as string,
            );
            if (deleteErr) {
              Alert.alert("Error", "Failed to delete trip: " + deleteErr);
            } else {
              router.back();
            }
          },
        },
      ],
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
