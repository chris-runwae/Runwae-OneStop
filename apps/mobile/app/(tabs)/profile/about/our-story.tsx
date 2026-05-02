import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import ScreenHeader from "@/components/ui/ScreenHeader";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";

const OurStoryScreen = () => {
  return (
    <AppSafeAreaView>
      <ScreenHeader title="Our Story" subtitle="The journey behind Runwae" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-[20px] mt-6">
          <Image
            source={require("@/assets/images/runwae_story_header.png")}
            className="w-full h-[200px] rounded-3xl mb-8"
            resizeMode="cover"
          />

          <View className="gap-y-6">
            <View>
              <Text
                className="text-2xl font-bold text-black dark:text-white mb-2"
                style={{ fontFamily: "BricolageGrotesque-Bold" }}
              >
                Where It All Began
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 leading-6">
                Runwae was born from a simple observation: travel is beautiful,
                but the planning is often cluttered. We saw travelers juggling
                multiple apps, endless tabs, and fragmented information just to
                get from point A to point B.
              </Text>
            </View>

            <View>
              <Text
                className="text-2xl font-bold text-black dark:text-white mb-2"
                style={{ fontFamily: "BricolageGrotesque-Bold" }}
              >
                Our Mission
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 leading-6">
                Our mission is to create a "OneStop" experience that simplifies
                your journey. We believe that traveling should be about the
                destination and the memories you make, not the stress of
                managing logistics. Runwae brings everything you need—from
                discovery to boarding—into one seamless, premium interface.
              </Text>
            </View>

            <View className="bg-primary/10 dark:bg-pink-950/30 p-6 rounded-3xl border border-primary/20 dark:border-pink-900/50">
              <Text
                className="text-lg font-bold text-pink-600 dark:text-pink-400 mb-2"
                style={{ fontFamily: "BricolageGrotesque-SemiBold" }}
              >
                Designed for You
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-300 leading-6">
                Every detail in Runwae is crafted with care. We prioritize
                aesthetics, usability, and speed because we know that your time
                is precious. We're not just building an app; we're building your
                ultimate travel companion.
              </Text>
            </View>

            <View>
              <Text
                className="text-2xl font-bold text-black dark:text-white mb-2"
                style={{ fontFamily: "BricolageGrotesque-Bold" }}
              >
                The Future of Travel
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 leading-6">
                This is just the beginning. As we grow, our focus remains on
                innovation and providing value to our community. We invite you
                to be part of our story as we redefine what it means to travel
                with ease.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </AppSafeAreaView>
  );
};

export default OurStoryScreen;
