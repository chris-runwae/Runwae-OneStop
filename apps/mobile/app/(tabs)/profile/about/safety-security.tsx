import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import ScreenHeader from "@/components/ui/ScreenHeader";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const SafetySecurityScreen = () => {
  return (
    <AppSafeAreaView>
      <ScreenHeader title="Safety & Security" subtitle="Last updated February 20, 2026" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View className="px-[20px] mt-6 gap-y-6">
          <Section 
            title="1. Data Protection" 
            content="We use industry-standard encryption to protect your data both in transit and at rest. Your security is our top priority."
          />
          <Section 
            title="2. Secure Authentication" 
            content="We recommend using strong, unique passwords and enabling two-factor authentication (2FA) wherever possible to protect your account."
          />
          <Section 
            title="3. Reporting Issues" 
            content="If you believe your account has been compromised or you've found a security vulnerability, please contact us immediately at security@runwae.com."
          />
          <Section 
            title="4. Safe Travel Tips" 
            content="Always keep your personal information secure while traveling and use trusted networks when accessing the app."
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

export default SafetySecurityScreen;
