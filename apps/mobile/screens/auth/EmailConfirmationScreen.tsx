import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacer } from "@/components";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";

const EmailConfirmationScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/(auth)/login");
  };

  return (
    <AppSafeAreaView className="px-[20px]">
      <View className="flex-1 justify-between">
        <View className="flex-1 items-center justify-center">
          <View className="items-center justify-center">
            {/* Using welcome illustration to represent success/joining */}
            <Image
              source={require("@/assets/images/welcome-illustration.png")}
              className="w-[150px] h-[150px]"
              resizeMode="contain"
            />
          </View>

          <Spacer size={32} vertical />

          <Text
            style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
            className="text-3xl font-bold text-center dark:text-white"
          >
            Email Confirmed!
          </Text>

          <Spacer size={16} vertical />

          <Text className="text-gray-400 text-center leading-relaxed px-4">
            Your email has been successfully verified. You're all set to start
            planning your next adventure with Runwae.
          </Text>
        </View>

        <View style={{ paddingBottom: 24 }}>
          <TouchableOpacity
            onPress={handleContinue}
            className="bg-primary h-[45px] rounded-full w-full flex items-center justify-center"
          >
            <Text className="text-white font-medium text-base">Continue to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppSafeAreaView>
  );
};

export default EmailConfirmationScreen;

const styles = StyleSheet.create({});
