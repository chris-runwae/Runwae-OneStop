import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacer } from "@/components";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";

const PasswordSuccessResetScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBackToLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/(auth)/login");
  };

  return (
    <AppSafeAreaView className="px-[20px]">
      <View className="flex-1 justify-between">
        <View className="flex-1 items-center justify-center">
          <View className="items-center justify-center">
            {/* Using the lock vector which represents security/passwords */}
            <Image
              source={require("@/assets/images/lock-vector.png")}
              className="w-[100px] h-[100px]"
              resizeMode="contain"
            />
          </View>

          <Spacer size={32} vertical />

          <Text
            style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
            className="text-3xl font-bold text-center dark:text-white"
          >
            Password Reset
          </Text>

          <Spacer size={16} vertical />

          <Text className="text-gray-400 text-center leading-relaxed px-4">
            Your password has been successfully reset. You can now use your new
            password to log in.
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

export default PasswordSuccessResetScreen;

const styles = StyleSheet.create({});
