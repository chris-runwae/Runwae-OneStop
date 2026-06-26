import FloatingTabBar from '@/components/floating-tab';
import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { Platform, View } from 'react-native';

const NATIVE_TABS_ENABLED =
  Platform.OS === 'ios' &&
  parseInt(String(Platform.Version), 10) >= 18 &&
  process.env.EXPO_PUBLIC_NATIVE_TABS !== '0';

export default function TabLayout() {
  if (NATIVE_TABS_ENABLED) {
    return (
      <NativeTabs tintColor="#FF2E92">
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="house.fill" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="explore">
          <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="magnifyingglass" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(trips)">
          <NativeTabs.Trigger.Label>Trips</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="airplane" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="person.crop.circle.fill" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="create" role="search">
          <NativeTabs.Trigger.Label>Create</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="plus" />
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
        <Tabs.Screen name="(trips)" options={{ title: 'Trips' }} />
        <Tabs.Screen name="create" options={{ title: 'Create' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
      <FloatingTabBar />
    </View>
  );
}

export { NATIVE_TABS_ENABLED };
