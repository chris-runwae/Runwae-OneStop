import * as Haptics from "expo-haptics";
import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacer } from "@/components";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";

const EmailVerificationSentScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const handleBackToLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/(auth)/login");
  };

  return (
    <AppSafeAreaView className="px-[20px]">
      <View className="flex-1 justify-between">
        <View className="flex-1 items-center justify-center">
          <View className="items-center justify-center">
            {/* Using plane icon to represent sending/movement */}
            <Image
              source={require("@/assets/images/plane.png")}
              className="w-[120px] h-[120px]"
              resizeMode="contain"
            />
          </View>

          <Spacer size={32} vertical />

          <Text
            style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
            className="text-3xl font-bold text-center dark:text-white"
          >
            Verify your email
          </Text>

          <Spacer size={16} vertical />

          <Text className="text-gray-400 text-center leading-relaxed px-4">
            We've sent a verification link to{" "}
            <Text className="font-semibold text-primary">{email || "your email"}</Text>.
            Please click the link in the email to activate your account.
          </Text>
        </View>

        <View style={{ paddingBottom: 24 }}>
          <TouchableOpacity
            onPress={handleBackToLogin}
            className="bg-primary h-[45px] rounded-full w-full flex items-center justify-center"
          >
            <Text className="text-white font-medium text-base">Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppSafeAreaView>
  );
};

export default EmailVerificationSentScreen;

const styles = StyleSheet.create({});
