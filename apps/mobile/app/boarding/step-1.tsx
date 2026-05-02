import BoardingHeader from "@/components/boarding/boardingHeader";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import { useAuth } from "@/context/AuthContext";
import { uploadProfileImage } from "@/utils/supabase/storage";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const BoardingStep1 = () => {
  const router = useRouter();
  const { user, updateUser, setCurrentBoardingStep } = useAuth();
  const [name, setName] = useState(user?.full_name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [profileImage, setProfileImage] = useState<string | null>(user?.avatar_url || null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "We need access to your photos to set a profile image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleNext = async () => {
    if (!name || !username) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert("Required fields", "Please provide your name and a username.");
      return;
    }

    setIsLoading(true);
    try {
      let finalImageUrl = profileImage;
      
      // If image is a local URI, upload it
      if (profileImage && profileImage.startsWith('file://')) {
        finalImageUrl = await uploadProfileImage(user!.id, profileImage);
      }

      await updateUser({
        full_name: name,
        username: username,
        avatar_url: finalImageUrl || undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await setCurrentBoardingStep(2);
      router.push("/boarding/step-2");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppSafeAreaView>
      <KeyboardAwareScrollView 
        bottomOffset={100} 
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20 }}
      >
        <BoardingHeader currentStep={1} totalSteps={5} />

        <View className="flex-1 gap-y-6 mt-4">
          <View className="gap-y-2">
            <Text
              className="text-black dark:text-white text-2xl font-bold"
              style={{ fontFamily: "BricolageGrotesque-Bold" }}
            >
              Set up your profile
            </Text>
            <Text className="text-gray-400 text-sm">
              How should the Runwae community see you?
            </Text>
          </View>

          <View className="items-center justify-center my-4">
            <TouchableOpacity 
              onPress={pickImage}
              style={styles.imageContainer}
              className="bg-gray-100 dark:bg-dark-seconndary/50 border border-gray-200 dark:border-dark-seconndary overflow-hidden"
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View className="items-center justify-center flex-1">
                  <Text className="text-gray-400 text-4xl">+</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text className="text-primary text-xs mt-2 font-medium">Add Photo</Text>
          </View>

          <View className="gap-y-4">
            <View>
              <Text className="text-gray-500 text-xs mb-2 ml-1">Full Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="John Doe"
                className="bg-gray-50 dark:bg-dark-seconndary/50 border border-gray-200 dark:border-dark-seconndary p-4 rounded-xl text-black dark:text-white"
                placeholderTextColor="#999"
              />
            </View>

            <View>
              <Text className="text-gray-500 text-xs mb-2 ml-1">Username</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="johndoe"
                autoCapitalize="none"
                className="bg-gray-50 dark:bg-dark-seconndary/50 border border-gray-200 dark:border-dark-seconndary p-4 rounded-xl text-black dark:text-white"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>

        <View className="pb-6 mt-8">
          <TouchableOpacity
            className="bg-primary h-[45px] rounded-full w-full flex items-center justify-center disabled:opacity-50"
            onPress={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-medium text-base">Next</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </AppSafeAreaView>
  );
};

export default BoardingStep1;

const styles = StyleSheet.create({
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  }
});
