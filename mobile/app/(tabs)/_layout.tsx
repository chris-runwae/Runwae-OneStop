// import { Tabs } from 'expo-router';
import {
  NativeTabs,
  Icon,
  Label,
  // Badge,
  // VectorIcon,
} from 'expo-router/unstable-native-tabs';
import React from 'react';

// import { HapticTab } from '@/components/haptic-tab';
// import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    // <Tabs
    //   screenOptions={{
    //     tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
    //     headerShown: false,
    //     tabBarButton: HapticTab,
    //   }}>
    //   <Tabs.Screen
    //     name="index"
    //     options={{
    //       title: 'Home',
    //       tabBarIcon: ({ color }) => (
    //         <IconSymbol size={28} name="house.fill" color={color} />
    //       ),
    //     }}
    //   />
    //   {/* <Tabs.Screen
    //     name="home"
    //     options={{
    //       title: 'Home2',
    //       tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
    //     }}
    //   /> */}
    //   <Tabs.Screen
    //     name="explore"
    //     options={{
    //       title: 'Explore',
    //       tabBarIcon: ({ color }) => (
    //         <IconSymbol size={28} name="paperplane.fill" color={color} />
    //       ),
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="trips"
    //     options={{
    //       title: 'Trips',
    //       tabBarIcon: ({ color }) => (
    //         <IconSymbol size={28} name="airplane.departure" color={color} />
    //       ),
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="profile"
    //     options={{
    //       title: 'Profile',
    //       tabBarIcon: ({ color }) => (
    //         <IconSymbol size={28} name="person.fill" color={color} />
    //       ),
    //     }}
    //   />
    // </Tabs>
    <NativeTabs backgroundColor={colors.backgroundColors.default}>
      <NativeTabs.Trigger name="index" options={{ title: 'Home' }}>
        <Icon
          sf={'house.fill'}
          drawable="ic_home"
          selectedColor={colors.primaryColors.border}
        />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore" options={{ title: 'Explore' }}>
        <Icon
          sf={'paperplane.fill'}
          drawable="ic_explore"
          selectedColor={colors.primaryColors.border}
        />
        <Label>Explore</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="trips" options={{ title: 'Trips' }}>
        <Icon
          sf={'airplane.departure'}
          drawable="ic_trips"
          selectedColor={colors.primaryColors.border}
        />
        <Label>Trips</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" options={{ title: 'Profile' }}>
        <Icon
          sf={'person.fill'}
          drawable="ic_profile"
          selectedColor={colors.primaryColors.border}
        />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
