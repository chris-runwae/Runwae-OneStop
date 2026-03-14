import CustomModal from "@/components/ui/CustomModal";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useAuth } from "@/context/AuthContext";
import { createFeedback } from "@/utils/supabase/feedback.service";
import { router } from "expo-router";
import { Check, ChevronDown } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FEEDBACK_TYPES = [
  "App Suggestion",
  "Compliment",
  "App Experience",
  "Navigation Issue",
  "Feature Request",
  "General Feedback",
];

const Feedback = () => {
  const { user } = useAuth();
  const [feedbackType, setFeedbackType] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isValid =
    feedbackType.trim().length > 0 && description.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid || !user) return;

    setIsSubmitting(true);
    try {
      const { success, error } = await createFeedback({
        user_id: user.id,
        user_email: user.email,
        feedback_type: feedbackType,
        description: description,
      });

      if (success) {
        console.log("Feedback submitted successfully");
        router.back();
      } else {
        console.error("Failed to submit feedback:", error);
        alert("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("An unexpected error occurred.");
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
          style={{ paddingBottom: 50 }}
        >
          <ScreenHeader
            title="Feedback & Suggestions"
            subtitle="Help us improve Runwae with your thoughts."
          />

          <View className="mt-5 px-[20px] flex-1 gap-y-6">
            <Text className="text-base text-gray-400">
              We’re building Runwae for travelers like you. Share your thoughts
              to help us make every trip better.
            </Text>

            <View className="gap-y-2 mt-5">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Feedback Type
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowModal(true)}
                className="flex-row items-center justify-between w-full bg-gray-50 dark:bg-dark-seconndary/50 border border-gray-200 dark:border-dark-seconndary rounded-lg px-4 py-3"
              >
                <Text
                  className={`text-base ${
                    feedbackType
                      ? "text-black dark:text-white"
                      : "text-gray-400"
                  }`}
                >
                  {feedbackType || "Choose a category"}
                </Text>
                <ChevronDown size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View className="gap-y-2">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Feedback Details
              </Text>
              <TextInput
                className="w-full bg-gray-50 dark:bg-dark-seconndary/50 border border-gray-200 dark:border-dark-seconndary rounded-lg px-4 py-3 text-base text-black dark:text-white min-h-[120px]"
                placeholder="Share your thoughts or ideas here..."
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          <View className="p-[20px]">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isValid || isSubmitting}
              activeOpacity={0.8}
              className={`w-full h-[44px] rounded-[10px] items-center justify-center ${
                isValid && !isSubmitting ? "bg-primary" : "bg-primary/50"
              }`}
            >
              <Text className="text-white">
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Feedback Type Modal */}
      <CustomModal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        title="Select Feedback Type"
      >
        <View className="gap-y-2">
          {FEEDBACK_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => {
                setFeedbackType(type);
                setShowModal(false);
              }}
              className={`flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0`}
            >
              <Text
                className={`text-base ${
                  feedbackType === type
                    ? "font-semibold text-primary"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {type}
              </Text>
              {feedbackType === type && (
                <Check size={18} color="#FF2E92" strokeWidth={3} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </CustomModal>
    </SafeAreaView>
  );
};

export default Feedback;
