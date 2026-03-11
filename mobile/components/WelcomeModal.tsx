import React from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/30">
        <SafeAreaView className="flex-1 items-center pb-2 justify-end w-full">
          <View className="bg-white rounded-[50px] p-6 w-full max-w-[368px] mx-auto shadow-2xl">
            <View className="items-center mb-2">
              <View className="w-[160px] h-[160px] mb-10">
                <Image
                  source={require("@/assets/images/welcome-illustration.png")}
                  style={{ width: 160, height: 160, resizeMode: "contain" }}
                />
              </View>
              <Text
                style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
                className="text-2xl font-bold text-center text-gray-800"
              >
                Welcome to Runwae!
              </Text>
            </View>

            <Text className="text-gray-600 text-center text-base mb-8 leading-relaxed">
              We're excited to help you plan your next adventure. Discover new
              destinations and create your dream itinerary.
            </Text>

            <View className="gap-y-3">
              <TouchableOpacity
                onPress={onClose}
                className="bg-primary h-[45px] rounded-full w-full items-center justify-center disabled:opacity-50"
              >
                <Text className="text-white font-medium text-base">
                  Let's Go!
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default WelcomeModal;
