import CustomModal from "@/components/ui/CustomModal";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface TripCreatedModalProps {
  isVisible: boolean;
  onClose: () => void;
  destination: string;
  onStartPlanning: () => void;
  onShare: () => void;
}

const TripCreatedModal = ({
  isVisible,
  onClose,
  destination,
  onStartPlanning,
  onShare,
}: TripCreatedModalProps) => {
  return (
    <CustomModal
      isVisible={isVisible}
      onClose={onClose}
      showIndicator={false}
      centeredTitle={true}
      maxContentHeight="100%"
    >
      <View className="items-center px-4 justify-between h-[650px] pb-5">
        <View className="items-center justify-center flex-1">
          <View className="mb-6 mt-4">
            <Image
              source={require("@/assets/images/trip-created-icon.png")}
              style={{ width: 120, height: 120 }}
              resizeMode="contain"
            />
          </View>

          <Text
            className="text-2xl font-bold text-black dark:text-white mb-3 text-center"
            style={{ fontFamily: "BricolageGrotesque-Bold" }}
          >
            Pack your bags!
          </Text>

          <Text className="text-base text-gray-400 dark:text-gray-500 text-center mb-10 leading-6 px-4">
            You’re off to {destination}! A confirmation email is on its way so
            be on the lookout for it.
          </Text>
        </View>

        <View className="w-full gap-y-4">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onStartPlanning}
            className="bg-primary h-[45px] rounded-full justify-center items-center"
          >
            <Text className="text-white">Start Planning!</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onShare}
            className="bg-white dark:bg-transparent h-[45px] rounded-full justify-center items-center border border-gray-200 dark:border-gray-600"
          >
            <Text className="text-gray-600 dark:text-gray-300">
              Share Details
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </CustomModal>
  );
};

export default TripCreatedModal;
