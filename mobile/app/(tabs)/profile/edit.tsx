import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useAuth } from "@/context/AuthContext";
import { uploadProfileImage } from "@/utils/supabase/storage";
import { useTheme } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Camera } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ProfileEditScreen = () => {
  const { user, updateUser } = useAuth();
  const { dark } = useTheme();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImagePick = () => {
    Alert.alert("Profile Photo", "Choose an option to update your photo", [
      {
        text: "Take Photo",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert(
              "Permission Denied",
              "We need camera permissions to take a photo.",
            );
            return;
          }

          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });

          if (!result.canceled) {
            setTempAvatar(result.assets[0].uri);
          }
        },
      },
      {
        text: "Choose from Gallery",
        onPress: async () => {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert(
              "Permission Denied",
              "We need gallery permissions to pick a photo.",
            );
            return;
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });

          if (!result.canceled) {
            setTempAvatar(result.assets[0].uri);
          }
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }

    if (!user?.id) return;

    setIsUpdating(true);
    setError(null);

    try {
      let avatarUrl = user.avatar_url;

      // If there's a new image selected, upload it first
      if (tempAvatar) {
        avatarUrl = await uploadProfileImage(user.id, tempAvatar);
      }

      const result = await updateUser({
        full_name: fullName.trim(),
        avatar_url: avatarUrl,
      });

      if (result.success) {
        router.back();
      } else {
        setError(result.error || "Failed to update profile");
      }
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AppSafeAreaView>
      <ScreenHeader
        title="Edit Profile"
        subtitle="Update your personal information"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View className="mt-10 items-center">
            {/* Avatar Section */}
            <TouchableOpacity
              activeOpacity={0.9}
              className="relative"
              onPress={handleImagePick}
            >
              <View className="h-28 w-28 rounded-full bg-primary overflow-hidden flex items-center justify-center border border-gray-100 dark:border-gray-800 shadow-sm">
                {tempAvatar || user?.avatar_url ? (
                  <Image
                    source={{ uri: tempAvatar || user?.avatar_url }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Text className="text-3xl font-bold text-white">
                    {fullName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2)}
                  </Text>
                )}
              </View>
              <View className="absolute bottom-0 right-0 h-8 w-8 bg-black/60 dark:bg-white/10 rounded-full items-center justify-center backdrop-blur-md">
                <Camera size={14} color="#ffffff" />
              </View>
            </TouchableOpacity>
          </View>

          <View className="px-[24px] mt-10 gap-y-8">
            {/* Name Field */}
            <View>
              <Text className="text-[11px] font-bold text-gray-400/80 dark:text-gray-500/80 mb-3 ml-1 tracking-widest uppercase">
                Full Name
              </Text>
              <View className="bg-gray-50/50 dark:bg-dark-seconndary/50 rounded-2xl px-5 py-4 border border-gray-100 dark:border-gray-800/50">
                <TextInput
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    setError(null);
                  }}
                  placeholder="Enter your full name"
                  placeholderTextColor="#adb5bd"
                  className="text-base text-black dark:text-white"
                  style={{ fontFamily: "BricolageGrotesque-Medium" }}
                />
              </View>
            </View>

            {/* Email Field (Read-only) */}
            <View>
              <View className="flex-row justify-between items-center mb-3 ml-1">
                <Text className="text-[11px] font-bold text-gray-400/80 dark:text-gray-500/80 tracking-widest uppercase">
                  Email Address
                </Text>
                <View className="bg-gray-100 dark:bg-dark-seconndary px-2 py-0.5 rounded-md">
                  <Text className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                    Read Only
                  </Text>
                </View>
              </View>
              <View className="bg-gray-100/30 dark:bg-dark-seconndary/20 rounded-2xl px-5 py-4 border border-gray-100 dark:border-gray-800/30">
                <TextInput
                  value={email}
                  editable={false}
                  placeholder="Your email address"
                  placeholderTextColor="#adb5bd"
                  className="text-base text-gray-400"
                  style={{ fontFamily: "BricolageGrotesque-Medium" }}
                />
              </View>
            </View>

            {error && (
              <Text className="text-red-500 text-xs mt-2 text-center font-semibold tracking-tight uppercase">
                {error}
              </Text>
            )}

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={isUpdating}
              className={`mt-4 w-full h-[44px] rounded-[10px] items-center justify-center ${
                isUpdating ? "bg-primary/50" : "bg-primary"
              }`}
              activeOpacity={0.8}
            >
              {isUpdating ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text
                  className="text-white font-bold"
                  style={{ fontFamily: "BricolageGrotesque-Bold" }}
                >
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppSafeAreaView>
  );
};

export default ProfileEditScreen;
