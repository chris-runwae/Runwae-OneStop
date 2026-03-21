import { Stack } from "expo-router";
import React from "react";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="support/index" />
      <Stack.Screen name="support/help-center" />
      <Stack.Screen name="support/contact-support" />
      <Stack.Screen name="support/report-issue" />
      <Stack.Screen name="support/feedback" />
      <Stack.Screen name="appearance/index" />
      <Stack.Screen name="security/index" />
      <Stack.Screen name="security/change-password" />
      <Stack.Screen name="security/two-factor-auth" />
      <Stack.Screen name="about/index" />
    </Stack>
  );
}
