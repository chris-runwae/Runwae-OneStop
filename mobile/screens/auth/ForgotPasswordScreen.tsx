import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

import { Spacer } from "@/components";
import CustomTextInput from "@/components/containers/TextInput";
import { useAuth } from "@/context/AuthContext";
import {
  ForgotPasswordFormData,
  forgotPasswordSchema,
} from "@/utils/validation/auth.validation";
import { ArrowLeft } from "lucide-react-native";
import z from "zod";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";

const ForgotPasswordScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { resetPassword, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [errors, setErrors] = useState<ForgotPasswordFormData>({
    email: "",
  });

  const handleInputChange = (
    field: keyof ForgotPasswordFormData,
    value: string,
  ) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      forgotPasswordSchema.parse(formData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const result = await resetPassword(formData.email);

      if (!result.success) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Toast.show({
          type: "error",
          text1: "Reset Password Error",
          text2: result.error,
          position: "bottom",
          visibilityTime: 4000,
          autoHide: true,
        });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({
          type: "success",
          text1: "Email Sent",
          text2: "Password reset link has been sent to your email",
          position: "bottom",
          visibilityTime: 3000,
          autoHide: true,
        });
        router.push({
          pathname: "/(auth)/check-email",
          params: { email: formData.email },
        } as any);
      }
    } catch (error: any) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (error instanceof z.ZodError) {
        const newErrors: ForgotPasswordFormData = { email: "" };
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            const field = issue.path[0] as keyof ForgotPasswordFormData;
            newErrors[field] = issue.message;
          }
        });
        setErrors(newErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppSafeAreaView className="px-[20px]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View style={{ paddingTop: 24 }}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-[50px] h-[50px] rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
            >
              <ArrowLeft size={20} color="#374151" className="dark:text-gray-300" />
            </TouchableOpacity>
          </View>

          <Spacer size={32} vertical />

          <Text
            style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
            className="text-3xl font-bold dark:text-white"
          >
            Forgot Password?
          </Text>

          <Spacer size={16} vertical />

          <Text className="text-gray-400 leading-relaxed">
            No worries! Please enter the email associated with your account and
            we will send you a reset link.
          </Text>

          <Spacer size={40} vertical />

          <CustomTextInput
            label="Email Address"
            keyboardType="email-address"
            placeholder="example@email.com"
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            error={errors.email}
          />

          <Spacer size={32} vertical />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || authLoading}
            className="bg-primary h-[45px] rounded-full w-full flex items-center justify-center disabled:opacity-50"
          >
            {isSubmitting || authLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white font-medium text-base">Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </AppSafeAreaView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
