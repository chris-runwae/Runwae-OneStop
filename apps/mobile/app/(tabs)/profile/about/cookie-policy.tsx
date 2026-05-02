import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import ScreenHeader from "@/components/ui/ScreenHeader";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const CookiePolicyScreen = () => {
  return (
    <AppSafeAreaView>
      <ScreenHeader title="Cookie Policy" subtitle="Last updated January 15, 2026" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View className="px-[20px] mt-6 gap-y-6">
          <Section 
            title="1. What Are Cookies?" 
            content="Cookies are small data files that are placed on your device when you visit an app or website. They are used to help the app remember information about your visit."
          />
          <Section 
            title="2. How We Use Cookies" 
            content="We use cookies to understand how you interact with our services, to improve your experience, and to provide personalized content and advertising."
          />
          <Section 
            title="3. Types of Cookies We Use" 
            content="We use essential cookies for the app to function, and analytical cookies to help us improve our services over time."
          />
          <Section 
            title="4. Your Choices" 
            content="You can manage your cookie preferences through your device settings, although some features of the app may not function properly without cookies."
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

export default CookiePolicyScreen;
