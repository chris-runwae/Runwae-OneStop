import CustomTextInput from "@/components/containers/TextInput";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useAuth } from "@/context/AuthContext";
import {
  ChangePasswordFormData,
  changePasswordSchema,
} from "@/utils/validation/auth.validation";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import { z } from "zod";

const ChangePassword = () => {
  const { updatePassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<ChangePasswordFormData>>({});

  const handleInputChange = (
    field: keyof ChangePasswordFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      changePasswordSchema.parse(formData);

      const result = await updatePassword(formData.newPassword);

      if (result.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Password updated successfully",
          position: "bottom",
        });
        router.back();
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: result.error || "Failed to update password",
          position: "bottom",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<ChangePasswordFormData> = {};
        error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof ChangePasswordFormData;
          if (field) newErrors[field] = issue.message;
        });
        setErrors(newErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          style={{ paddingBottom: 100 }}
        >
          <ScreenHeader
            title="Change your password"
            subtitle="Keep your account secure with a new password."
          />

          <View className="mt-5 px-[20px] flex-1 gap-y-6">
            <Text className="text-base text-gray-400">
              Enter a Password that you can remember. New password can not be
              the same as your old password
            </Text>

            <View className="gap-y-4">
              <CustomTextInput
                label="Current Password"
                labelStyle="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                value={formData.currentPassword}
                isPassword
                onChangeText={(val) =>
                  handleInputChange("currentPassword", val)
                }
                error={errors.currentPassword}
              />
              <CustomTextInput
                label="Enter New Password"
                labelStyle="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                value={formData.newPassword}
                isPassword
                onChangeText={(val) => handleInputChange("newPassword", val)}
                error={errors.newPassword}
              />
              <CustomTextInput
                label="Confirm New Password"
                labelStyle="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                value={formData.confirmPassword}
                isPassword
                onChangeText={(val) =>
                  handleInputChange("confirmPassword", val)
                }
                error={errors.confirmPassword}
              />
            </View>

            <View className="mt-10">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.8}
                className={`h-[44px] w-full items-center justify-center rounded-full bg-primary ${
                  isSubmitting ? "opacity-50" : ""
                }`}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-base font-semibold text-white">
                    Change password
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChangePassword;
