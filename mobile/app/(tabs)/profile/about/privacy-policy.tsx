import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import ScreenHeader from "@/components/ui/ScreenHeader";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const PrivacyPolicyScreen = () => {
  return (
    <AppSafeAreaView>
      <ScreenHeader title="Privacy Policy" subtitle="Last updated March 10, 2026" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View className="px-[20px] mt-6 gap-y-6">
          <Section 
            title="1. Information Collection" 
            content="We collect information you provide directly to us, such as when you create an account, plan a trip, or contact us for support."
          />
          <Section 
            title="2. How We Use Information" 
            content="We use your information to provide, maintain, and improve our services, including to personalize your travel experience and communicate with you."
          />
          <Section 
            title="3. Information Sharing" 
            content="We do not share your personal information with third parties except as necessary to provide our services or as required by law."
          />
          <Section 
            title="4. Data Security" 
            content="We implement reasonable measures to protect your information from loss, theft, and unauthorized access."
          />
          <Section 
            title="5. Your Choices" 
            content="You can access and update your account information at any time through the app's settings."
          />
        </View>
      </ScrollView>
    </AppSafeAreaView>
  );
};

const Section = ({ title, content }: { title: string; content: string }) => (
  <View>
    <Text 
      className="text-lg font-bold text-black dark:text-white mb-2"
      style={{ fontFamily: "BricolageGrotesque-SemiBold" }}
    >
      {title}
    </Text>
    <Text className="text-base text-gray-500 dark:text-gray-400 leading-6">
      {content}
    </Text>
  </View>
);

export default PrivacyPolicyScreen;
