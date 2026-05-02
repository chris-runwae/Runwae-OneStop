import CustomTextInput from "@/components/containers/TextInput";
import CustomModal from "@/components/ui/CustomModal";
import ScreenHeader from "@/components/ui/ScreenHeader";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { Check, ChevronDown } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
      // Direct Convex feedback module isn't yet wired; until then, send
      // the user to email so we never lose feedback. Replace with
      // api.feedback.create when the backend module ships.
      const subject = encodeURIComponent(`Runwae feedback: ${feedbackType}`);
      const body = encodeURIComponent(description);
      const mailto = `mailto:support@runwae.io?subject=${subject}&body=${body}`;
      // eslint-disable-next-line no-undef
      (await import('react-native')).Linking.openURL(mailto);
      router.back();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppSafeAreaView>
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

            <CustomTextInput
              label="Feedback Details"
              labelStyle="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              textarea
              placeholder="Share your thoughts or ideas here..."
              value={description}
              onChangeText={setDescription}
            />
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
    </AppSafeAreaView>
  );
};

export default Feedback;
