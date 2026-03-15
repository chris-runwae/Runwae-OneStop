import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

import { Spacer } from "@/components";
import { useAuth } from "@/hooks/useAuth";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";

const CheckEmailScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { resetPassword, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const email = (params.email as string) || "";

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleResendEmail = async () => {
    if (!canResend || !email) return;

    try {
      setIsSubmitting(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const result = await resetPassword(email);

      if (!result.success) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Toast.show({
          type: "error",
          text1: "Resend Error",
          text2: result.error,
          position: "bottom",
          visibilityTime: 4000,
          autoHide: true,
        });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({
          type: "success",
          text1: "Email Resent",
          text2: "Password reset link has been sent again",
          position: "bottom",
          visibilityTime: 3000,
          autoHide: true,
        });
        // Reset countdown
        setCountdown(59);
        setCanResend(false);
      }
    } catch (error) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Toast.show({
        type: "error",
        text1: "Resend Error",
        text2: "An unexpected error occurred",
        position: "bottom",
        visibilityTime: 4000,
        autoHide: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOpenEmail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/(auth)/reset-password");
  };

  return (
    <>
      <AppSafeAreaView className="px-[20px]">
        <View className="flex flex-1 justify-between">
          <View className="flex-1 items-center justify-center">
            <View className="items-center justify-center">
              <Image
                source={require("@/assets/images/lock-vector.png")}
                className="w-[70px] h-[70px]"
                resizeMode="contain"
              />
            </View>

            <Spacer size={10} vertical />

            <Text
              style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
              className="text-3xl font-bold text-center"
            >
              Check your email
            </Text>

            <Spacer size={5} vertical />

            <Text className="text-gray-400 text-center leading-relaxed px-4">
              We sent a password reset link to your email address. Please check
              your inbox and follow the instructions to reset your password.
            </Text>
          </View>

          <View>
            <TouchableOpacity
              onPress={handleResendEmail}
              disabled={!canResend || isSubmitting}
              className="flex items-center justify-center"
            >
              <Text className="text-gray-400 text-sm">
                Didn't get an email?{" "}
                <Text className="font-semibold text-primary">
                  {canResend ? "Resend" : `Resend in ${formatTime(countdown)}`}
                </Text>
              </Text>
            </TouchableOpacity>

            <Spacer size={5} vertical />

            <TouchableOpacity
              onPress={handleOpenEmail}
              className="bg-primary h-[45px] rounded-full w-full flex items-center justify-center"
            >
              <Text className="text-white font-medium text-base">
                Open Email
              </Text>
            </TouchableOpacity>

            <Spacer size={16} vertical />

            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
              className="bg-white border border-gray-200 h-[45px] rounded-full w-full flex items-center justify-center"
            >
              <Text className="text-gray-700 font-medium text-base">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AppSafeAreaView>
    </>
  );
};

export default CheckEmailScreen;
