import { getCurrencySymbol } from "@/utils/currency";
import React from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export type TripVisibility = "private" | "invite_only" | "public";

const CURRENCY_CHOICES = ["GBP", "USD", "EUR", "JPY", "CAD", "AUD"] as const;

const VISIBILITY_CHOICES: { value: TripVisibility; label: string; hint: string }[] = [
  {
    value: "private",
    label: "Private",
    hint: "Only people you add can see this trip.",
  },
  {
    value: "invite_only",
    label: "Invite-only",
    hint: "Visible to anyone with the join code or link.",
  },
  {
    value: "public",
    label: "Public",
    hint: "Anyone on Runwae can discover this trip.",
  },
];

interface TripDetailsStepProps {
  width: number;
  dark: boolean;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  image: string | null;
  pickImage: () => Promise<void>;
  // Pickers are gated on the value + setter being provided so the
  // component remains usable for read-only flows that don't need them.
  currency?: string;
  setCurrency?: (currency: string) => void;
  visibility?: TripVisibility;
  setVisibility?: (visibility: TripVisibility) => void;
}

export const TripDetailsStep: React.FC<TripDetailsStepProps> = ({
  width,
  dark,
  title,
  setTitle,
  description,
  setDescription,
  image,
  pickImage,
  currency,
  setCurrency,
  visibility,
  setVisibility,
}) => {
  const showCurrencyPicker = currency !== undefined && setCurrency !== undefined;
  const showVisibilityPicker =
    visibility !== undefined && setVisibility !== undefined;
  return (
    <View style={{ width }} className="px-5 pt-8">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text
          className="text-2xl font-bold dark:text-white mb-2"
          style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
        >
          Give your trip some {"\n"}personality ✨
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 mb-8">
          Personalise your trip; it's all in the details.
        </Text>

        <View className="mb-6">
          <Text className="text-sm font-semibold mb-2 dark:text-gray-300">
            Trip Title
          </Text>

          <TextInput
            className="bg-gray-100 dark:bg-dark-seconndary p-4 rounded-xl dark:text-white"
            placeholder="Weekend in Lisbon"
            placeholderTextColor={dark ? "#666" : "#999"}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold mb-2 dark:text-gray-300">
            Description
          </Text>

          <TextInput
            className="bg-gray-100 dark:bg-dark-seconndary p-4 rounded-xl dark:text-white h-32"
            placeholder="What's the vibe? Who's coming? Anything we should know?"
            placeholderTextColor={dark ? "#666" : "#999"}
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {showCurrencyPicker && (
          <View className="mb-6">
            <Text className="text-sm font-semibold mb-2 dark:text-gray-300">
              Currency
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {CURRENCY_CHOICES.map((code) => {
                const selected = code === currency;
                return (
                  <TouchableOpacity
                    key={code}
                    onPress={() => setCurrency!(code)}
                    className={`px-4 py-2 rounded-full border ${
                      selected
                        ? "bg-primary border-primary"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selected ? "text-white" : "text-black dark:text-white"
                      }`}
                    >
                      {getCurrencySymbol(code)} {code}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {showVisibilityPicker && (
          <View className="mb-6">
            <Text className="text-sm font-semibold mb-2 dark:text-gray-300">
              Who can see this trip?
            </Text>
            <View className="flex-row gap-2">
              {VISIBILITY_CHOICES.map((option) => {
                const selected = option.value === visibility;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setVisibility!(option.value)}
                    className={`flex-1 px-3 py-3 rounded-xl border items-center ${
                      selected
                        ? "bg-primary border-primary"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selected ? "text-white" : "text-black dark:text-white"
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {VISIBILITY_CHOICES.find((v) => v.value === visibility)?.hint}
            </Text>
          </View>
        )}

        <View className="mb-10">
          <Text className="text-sm font-semibold mb-2 dark:text-gray-300">
            Cover Image
          </Text>

          <TouchableOpacity
            onPress={pickImage}
            className="bg-gray-50 dark:bg-dark-seconndary/30 border border-gray-200 dark:border-white/10 rounded-[8px] h-40 items-center justify-center overflow-hidden"
          >
            {image ? (
              <Image source={{ uri: image }} className="w-full h-full" />
            ) : (
              <>
                <View className="mb-5">
                  <Image
                    source={require("@/assets/images/gallery-icon.png")}
                    style={{ width: 44, height: 44 }}
                    resizeMode="contain"
                  />
                </View>

                <Text className="text-primary font-semibold mb-2">
                  Tap to upload image
                </Text>
                <Text className="text-xs text-gray-400">
                  png or jpg (max 800x400px)
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
