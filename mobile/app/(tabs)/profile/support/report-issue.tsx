import CustomTextInput from "@/components/containers/TextInput";
import CustomModal from "@/components/ui/CustomModal";
import ScreenHeader from "@/components/ui/ScreenHeader";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import { useAuth } from "@/context/AuthContext";
import { createIssueReport } from "@/utils/supabase/issue-report.service";
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

const ISSUE_TYPES = [
  "App Crash",
  "Slow Performance",
  "UI Bug",
  "Payment Issue",
  "Feature Request",
  "Other",
];

const ReportIssue = () => {
  const { user } = useAuth();
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isValid = issueType.trim().length > 0 && description.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid || !user) return;

    setIsSubmitting(true);
    try {
      const { success, error } = await createIssueReport({
        user_id: user.id,
        user_email: user.email,
        issue_type: issueType,
        description: description,
      });

      if (success) {
        console.log("Issue report submitted successfully");
        router.back();
      } else {
        // Handle error (e.g., show a toast)
        console.error("Failed to submit issue report:", error);
        alert("Failed to submit report. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting issue report:", error);
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
            title="Report an Issue"
            subtitle="Let us know if you have any issues with our app."
          />

          <View className="mt-5 px-[20px] flex-1 gap-y-6">
            <Text className="text-base text-gray-400">
              Something not working right? Tell us what happened so we can fix
              it fast.
            </Text>

            <View className="gap-y-2 mt-5">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Issue Type
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowModal(true)}
                className="flex-row items-center justify-between w-full bg-gray-50 dark:bg-dark-seconndary/50 border border-gray-200 dark:border-dark-seconndary rounded-lg px-4 py-3"
              >
                <Text
                  className={`text-base ${
                    issueType ? "text-black dark:text-white" : "text-gray-400"
                  }`}
                >
                  {issueType || "Choose an issue type"}
                </Text>
                <ChevronDown size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <CustomTextInput
              label="Issue Details"
              labelStyle="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              textarea
              placeholder="Details of the issue..."
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
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Issue Type Modal */}
      <CustomModal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        title="Select Issue Type"
      >
        <View className="gap-y-2">
          {ISSUE_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => {
                setIssueType(type);
                setShowModal(false);
              }}
              className={`flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0`}
            >
              <Text
                className={`text-base ${
                  issueType === type
                    ? "font-semibold text-primary"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {type}
              </Text>
              {issueType === type && (
                <Check size={18} color="#FF2E92" strokeWidth={3} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </CustomModal>
    </AppSafeAreaView>
  );
};

export default ReportIssue;
