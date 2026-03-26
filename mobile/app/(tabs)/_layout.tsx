// import FloatingTabBar from "@/components/floating-tab";
// import { Colors } from "@/constants/theme";
// import { useColorScheme } from "@/hooks/use-color-scheme";
// import { Tabs } from "expo-router";
// import React from "react";
// import { View } from "react-native";

// export default function TabLayout() {
//   const colorScheme = useColorScheme();
//   const colors = Colors[colorScheme ?? "light"];

//   return (
//     <View style={{ flex: 1 }}>
//       <Tabs
//         screenOptions={{
//           headerShown: false,
//           tabBarStyle: { display: "none" },
//         }}
//       >
//         <Tabs.Screen name="index" options={{ title: "Home" }} />
//         <Tabs.Screen name="explore" options={{ title: "Explore" }} />
//         <Tabs.Screen name="(trips)" options={{ title: "Trips" }} />
//         <Tabs.Screen name="profile" options={{ title: "Profile" }} />
//       </Tabs>
//       <FloatingTabBar />
//     </View>
//   );
// }

import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf="house.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore">
        <Icon sf="gear" drawable="custom_settings_drawable" />
        <Label>Explore</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(trips)">
        <Label>Trips</Label>
        <Icon sf="house.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label>Profile</Label>
        <Icon sf="person" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="create-trip" role="search">
        <Label>Create Trip</Label>
        <Icon sf="plus" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
