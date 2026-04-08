import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import ScreenHeader from "@/components/ui/ScreenHeader";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const TermsOfServiceScreen = () => {
  return (
    <AppSafeAreaView>
      <ScreenHeader
        title="Terms of Use"
        subtitle="Last updated March 10, 2026"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View className="px-[20px] mt-6 gap-y-6">
          <Section
            title="1. Acceptance of Terms"
            content="By accessing and using Runwae-OneStop, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services."
          />
          <Section
            title="2. Use of Services"
            content="Our services are provided to help you plan and manage your travel. You agree to use the services only for lawful purposes and in accordance with these terms."
          />
          <Section
            title="3. User Accounts"
            content="To access certain features, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information."
          />
          <Section
            title="4. Intellectual Property"
            content="All content, features, and functionality of Runwae are owned by us and are protected by international copyright, trademark, and other intellectual property laws."
          />
          <Section
            title="5. Limitation of Liability"
            content="Runwae shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the services."
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

export default TermsOfServiceScreen;
