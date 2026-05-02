import React from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface TripDetailsStepProps {
  width: number;
  dark: boolean;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  image: string | null;
  pickImage: () => Promise<void>;
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
}) => {
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
            placeholder="Placeholder"
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
            placeholder="Placeholder"
            placeholderTextColor={dark ? "#666" : "#999"}
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View className="mb-10">
          <Text className="text-sm font-semibold mb-2 dark:text-gray-300">
            Header Image
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
