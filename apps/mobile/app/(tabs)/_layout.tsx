import FloatingTabBar from '@/components/floating-tab';
import { Tabs } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
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
          <Label>Home</Label>
          <Icon sf="house.fill" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="explore">
          <Label>Explore</Label>
          <Icon sf="magnifyingglass" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(trips)">
          <Label>Trips</Label>
          <Icon sf="airplane" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="wallet">
          <Label>Wallet</Label>
          <Icon sf="wallet.pass.fill" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <Label>Profile</Label>
          <Icon sf="person.crop.circle.fill" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="create" role="search">
          <Label>Create</Label>
          <Icon sf="plus" />
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
        <Tabs.Screen name="wallet" options={{ title: 'Wallet' }} />
        <Tabs.Screen name="create" options={{ title: 'Create' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
      <FloatingTabBar />
    </View>
  );
}

export { NATIVE_TABS_ENABLED };
