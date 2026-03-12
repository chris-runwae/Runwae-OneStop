import * as Haptics from "expo-haptics";
import { Link, useRouter } from "expo-router";
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
import { useAuth } from "@/hooks/useAuth";
import {
  SignUpFormData,
  signUpSchema,
} from "@/utils/validation/auth.validation";
import z from "zod";

const SignUpScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp, isLoading: authLoading, completeOnboarding } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<SignUpFormData>({
    fullName: "",
    email: "",
    password: "",
  });

  const handleInputChange = (field: keyof SignUpFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      signUpSchema.parse(formData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const result = await signUp(formData.email, formData.password);

      if (!result.success) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Toast.show({
          type: "error",
          text1: "Sign Up Error",
          text2: result.error,
          position: "bottom",
          visibilityTime: 4000,
          autoHide: true,
        });
      } else {
        // Navigate to boarding step after successful sign-up
        router.replace("/boarding/step-1");
      }
    } catch (error: any) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (error instanceof z.ZodError) {
        const newErrors: SignUpFormData = {
          fullName: "",
          email: "",
          password: "",
        };
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            const field = issue.path[0] as keyof SignUpFormData;
            newErrors[field] = issue.message;
          }
        });
        setErrors(newErrors);
      } else {
        Toast.show({
          type: "error",
          text1: "Sign Up Error",
          text2: error.message || "An error occurred during sign up",
          position: "bottom",
          visibilityTime: 4000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 px-[20px] bg-white"
      >
        <View style={{ paddingTop: insets.top + 24 }}>
          <Spacer size={24} vertical />
          <Text
            style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
            className="text-3xl font-bold"
          >
            Welcome to{"\n"}Runwae 🎉
          </Text>
          <Spacer size={5} vertical />

          <Text className="text-gray-400">
            Sign up for an account or{" "}
            <Link href="/(auth)/login" className="text-primary underline">
              log in
            </Link>{" "}
            here.
          </Text>
          <Spacer size={50} vertical />

          <CustomTextInput
            label="Full Name"
            placeholder="John Doe"
            value={formData.fullName}
            onChangeText={(value) => handleInputChange("fullName", value)}
            error={errors.fullName}
          />

          <Spacer size={16} vertical />

          <CustomTextInput
            label="Email address"
            keyboardType="email-address"
            placeholder="example@email.com"
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            error={errors.email}
          />

          <Spacer size={16} vertical />

          <CustomTextInput
            label="Password"
            isPassword
            value={formData.password}
            onChangeText={(value) => handleInputChange("password", value)}
            error={errors.password}
          />

          <Spacer size={16} vertical />

          <Spacer size={20} vertical />
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || authLoading}
            className="bg-primary h-[45px] rounded-full w-full flex items-center justify-center disabled:opacity-50"
          >
            {isSubmitting || authLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white font-medium text-base">Sign Up</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  forgotPasswordContainer: {
    alignItems: "flex-end",
    width: "100%",
  },
});
