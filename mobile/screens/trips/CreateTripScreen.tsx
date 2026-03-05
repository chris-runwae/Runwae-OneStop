import { View, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from "react-native";
import React, { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { Text, TextInput} from '@/components';
import { supabase } from "@/utils/supabase/client";
import { uploadGroupCoverImage } from "@/utils/supabase/storage";

export default function CreateTripScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);

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
      setCoverImage(result.assets[0].uri);
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
      setCoverImage(result.assets[0].uri);
    }
  };

  const showImagePicker = () => {
    Alert.alert("Select Profile Image", "Choose an option", [
      { text: "Camera", onPress: takePhoto },
      { text: "Photo Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleCreateTrip = async () => {
    console.log("handleCreateTrip", name, description, coverImage, user?.id);
    setIsLoading(true);

    try {
      if (!user) throw new Error("User not authenticated");

      // 1️⃣ Insert the trip/group row
      const { data: tripData, error: insertError } = await supabase
        .from("groups") // or "trips" table if separate
        .insert([
          {
            name,
            description,
            visibility: "public",
            type: "trip",
            owner_id: user.id,
          },
        ])
        .select()
        .single();

      if (insertError || !tripData) {
        throw insertError ?? new Error("Failed to create trip");
      }

      const tripId = tripData.id;

      // 2️⃣ Upload the cover image (after trigger has inserted owner)
      let coverImageUrl: string | null = null;
      if (coverImage) {
        try {
          coverImageUrl = await uploadGroupCoverImage(tripId, coverImage);
        } catch (err) {
          console.error("Failed to upload cover image:", err);
          Alert.alert(
            "Warning",
            "Failed to upload cover image. You can add it later."
          );
        }

        // 3️⃣ Update the trip with cover URL
        if (coverImageUrl) {
          const { error: updateError } = await supabase
            .from("groups")
            .update({ cover_image_url: coverImageUrl })
            .eq("id", tripId);

          if (updateError) console.error(
            "Failed to update trip with cover image URL",
            updateError
          );
        }
      }

      // ✅ Success
      Alert.alert("Success", "Trip created successfully!");
      // Navigate to trip page or refresh list
      router.push(`/(tabs)/(trips)/${tripId}`);
      return tripId;
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to create trip. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <KeyboardAwareScrollView bottomOffset={100} contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Add your information to get started
          </Text>
        </View>

        <View style={styles.form}>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={showImagePicker}
          >
            {coverImage ? (
              <Image
                cachePolicy={"none"}
                source={{ uri: coverImage }}
                style={styles.coverImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>+</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Text style={styles.editText}>Edit</Text>
            </View>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Trip Name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Trip Description"
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            autoCapitalize="none"
            multiline={true}
          />

          <TouchableOpacity style={styles.button} onPress={() => handleCreateTrip()}>
            {isLoading ? (
              <ActivityIndicator size={24} color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Complete Setup</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
    {/* <KeyboardToolbar /> */}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    color: "#666",
  },
  form: {
    width: "100%",
    alignItems: "center",
  },
  imageContainer: {
    marginBottom: 32,
    position: "relative",
  },
  coverImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f5f5f5",
  },
  placeholderImage: {
    width: 120,
    height: 120,
    backgroundColor: "#f5f5f5",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  placeholderText: {
    fontSize: 48,
    color: "#999",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  button: {
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkButton: {
    marginTop: 24,
    alignItems: "center",
  },
  linkButtonText: {
    color: "#666",
    fontSize: 14,
  },
  linkButtonTextBold: {
    fontWeight: "600",
    color: "#000",
  },
});
