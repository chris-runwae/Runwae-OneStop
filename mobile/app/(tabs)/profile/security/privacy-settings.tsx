import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import RadioOptions from "@/components/ui/RadioOptions";
import ScreenHeader from "@/components/ui/ScreenHeader";
import SwitchRow from "@/components/ui/SwitchRow";
import {
  PRIVACY_SECTIONS_METADATA,
  TRIP_VISIBILITY_OPTIONS,
} from "@/constants/privacy.constant";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";

const PrivacySettings = () => {
  const [settings, setSettings] = useState({
    profilePublic: true,
    tripVisibility: "public",
    showBadges: false,
    findByName: true,
    findByEmail: false,
    shareActivity: true,
    analyticsEnabled: true,
    personalizedAds: false,
  });

  const updateSetting =
    (key: keyof typeof settings) => (value: boolean | string) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    };

  const SettingsSection = ({
    title,
    items,
  }: (typeof PRIVACY_SECTIONS_METADATA)[0]) => (
    <View>
      <View className="mt-8 mb-2">
        <Text
          className="text-sm font-bold text-gray-400 uppercase tracking-wider"
          style={{ fontFamily: "BricolageGrotesque-Bold" }}
        >
          {title}
        </Text>
      </View>
      <View className="bg-gray-100 dark:bg-dark-seconndary/50 rounded-2xl p-4 border border-gray-200 dark:border-dark-seconndary/50">
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <SwitchRow
              label={item.label}
              description={item.description}
              value={settings[item.id as keyof typeof settings] as boolean}
              onValueChange={updateSetting(item.id as keyof typeof settings)}
            />
            {index < items.length - 1 && (
              <View className="h-[1px] bg-gray-200 dark:bg-dark-seconndary mx-1 my-3" />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );

  return (
    <AppSafeAreaView edges={["top", "left", "right"]}>
      <ScreenHeader
        title="Privacy Settings"
        subtitle="Manage how your information is shared and seen."
      />

      <ScrollView
        className="flex-1 px-[20px]"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Account Visibility Section */}
        <SettingsSection {...PRIVACY_SECTIONS_METADATA[0]} />

        {/* Discoverability and Data & Activity Sections */}
        {PRIVACY_SECTIONS_METADATA.slice(1).map((section) => (
          <SettingsSection key={section.title} {...section} />
        ))}

        {/* Trip Visibility Section - Moved above Discoverability */}
        <View className="mt-8 mb-2">
          <Text
            className="text-sm font-bold text-gray-400 uppercase tracking-wider"
            style={{ fontFamily: "BricolageGrotesque-Bold" }}
          >
            Who can see my trips
          </Text>
        </View>

        <View className="bg-gray-100 dark:bg-dark-seconndary/50 rounded-2xl p-4 border border-gray-200 dark:border-dark-seconndary/50">
          {TRIP_VISIBILITY_OPTIONS.map((option) => (
            <RadioOptions
              key={option.value}
              title={option.label}
              subtitle={option.subtitle}
              selected={settings.tripVisibility === option.value}
              onPress={() =>
                updateSetting("tripVisibility" as any)(option.value)
              }
            />
          ))}
        </View>
      </ScrollView>
    </AppSafeAreaView>
  );
};

export default PrivacySettings;
