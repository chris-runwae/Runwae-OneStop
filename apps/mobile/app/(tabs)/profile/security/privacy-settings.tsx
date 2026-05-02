import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import RadioOptions from '@/components/ui/RadioOptions';
import ScreenHeader from '@/components/ui/ScreenHeader';
import SwitchRow from '@/components/ui/SwitchRow';
import {
  PRIVACY_SECTIONS_METADATA,
  TRIP_VISIBILITY_OPTIONS,
} from '@/constants/privacy.constant';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

type SettingsSectionProps = (typeof PRIVACY_SECTIONS_METADATA)[0] & {
  settings: any;
  updateSetting: (key: string) => (value: boolean | string) => void;
};

const SettingsSection = ({
  title,
  items,
  settings,
  updateSetting,
}: SettingsSectionProps) => (
  <View>
    <View className="mb-2 mt-8">
      <Text
        className="text-sm font-bold uppercase tracking-wider text-gray-400"
        style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
        {title}
      </Text>
    </View>
    <View className="rounded-2xl border border-gray-200 bg-gray-100 p-4 dark:border-dark-seconndary/50 dark:bg-dark-seconndary/50">
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <SwitchRow
            label={item.label}
            description={item.description}
            value={settings[item.id] as boolean}
            onValueChange={updateSetting(item.id)}
          />
          {index < items.length - 1 && (
            <View className="mx-1 my-3 h-[1px] bg-gray-200 dark:bg-dark-seconndary" />
          )}
        </React.Fragment>
      ))}
    </View>
  </View>
);

const PrivacySettings = () => {
  const [settings, setSettings] = useState({
    profilePublic: true,
    tripVisibility: 'public',
    showBadges: false,
    findByName: true,
    findByEmail: false,
    shareActivity: true,
    analyticsEnabled: true,
    personalizedAds: false,
  });

  const updateSetting =
    (key: string) => (value: boolean | string) => {
      setSettings((prev: any) => ({ ...prev, [key]: value }));
    };

  return (
    <AppSafeAreaView edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Privacy Settings"
        subtitle="Manage how your information is shared and seen."
      />

      <ScrollView
        className="flex-1 px-[20px]"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>
        <SettingsSection
          {...PRIVACY_SECTIONS_METADATA[0]}
          settings={settings}
          updateSetting={updateSetting}
        />

        {PRIVACY_SECTIONS_METADATA.slice(1).map((section) => (
          <SettingsSection
            key={section.title}
            {...section}
            settings={settings}
            updateSetting={updateSetting}
          />
        ))}

        <View className="mb-2 mt-8">
          <Text
            className="text-sm font-bold uppercase tracking-wider text-gray-400"
            style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
            Who can see my trips
          </Text>
        </View>

        <View className="rounded-2xl border border-gray-200 bg-gray-100 p-4 dark:border-dark-seconndary/50 dark:bg-dark-seconndary/50">
          {TRIP_VISIBILITY_OPTIONS.map((option) => (
            <RadioOptions
              key={option.value}
              title={option.label}
              subtitle={option.subtitle}
              selected={settings.tripVisibility === option.value}
              onPress={() =>
                updateSetting('tripVisibility' as any)(option.value)
              }
            />
          ))}
        </View>
      </ScrollView>
    </AppSafeAreaView>
  );
};

export default PrivacySettings;
