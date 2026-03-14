import * as Haptics from "expo-haptics";
import { Link } from "expo-router";
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
import z from "zod";

import { Spacer } from "@/components";
import CustomTextInput from "@/components/containers/TextInput";
import { useAuth } from "@/context/AuthContext";
import { LoginFormData, loginSchema } from "@/utils/validation/auth.validation";

const LogInScreen = () => {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      loginSchema.parse(formData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const result = await signIn(formData.email, formData.password);

      if (!result.success) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Toast.show({
          type: "error",
          text1: "Login Error",
          text2: result.error,
          position: "bottom",
          visibilityTime: 4000,
          autoHide: true,
        });
      }
      // On success, RouteGuard handles navigation automatically
    } catch (error) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (error instanceof z.ZodError) {
        const newErrors = { email: "", password: "" };
        error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof LoginFormData;
          if (field) newErrors[field] = issue.message;
        });
        setErrors(newErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 px-[20px]"
    >
      <View style={{ paddingTop: insets.top + 24 }}>
        <Spacer size={24} vertical />
        <Text
          style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
          className="text-3xl font-bold text-black dark:text-white"
        >
          Welcome {"\n"}Back!
        </Text>
        <Spacer size={5} vertical />

        <Text className="text-gray-400">
          Login to your account or{" "}
          <Link href="/(auth)/signup" className="text-primary underline">
            sign up
          </Link>{" "}
          here.
        </Text>
        <Spacer size={50} vertical />

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
        <Spacer size={5} vertical />

        <View style={styles.forgotPasswordContainer}>
          <Link
            href={"/(auth)/forgot-password"}
            className="text-sm text-primary underline"
          >
            Forgot Password?
          </Link>
        </View>
        <Spacer size={20} vertical />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          className="bg-primary h-[45px] rounded-full w-full items-center justify-center disabled:opacity-50"
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white font-medium text-base">Log in</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LogInScreen;

const styles = StyleSheet.create({
  forgotPasswordContainer: {
    alignItems: "flex-end",
    width: "100%",
  },
});
