import { StyleSheet, Text } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { KeyboardAwareScrollView, KeyboardToolbar } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacer, TextInput } from "@/components";

const LogInScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <KeyboardAwareScrollView bottomOffset={62} contentContainerStyle={[styles.container, { paddingTop: insets.top + 24 }]}>
      <Spacer size={24} vertical />
      <Text>Welcome to Runwae🎉</Text>
      <Spacer size={24} vertical />

      <Text>Login to your account or <Link href="/(auth)/signup" style={styles.link}>sign up</Link> here.</Text>
      <Spacer size={24} vertical />

      <TextInput
        label="E-mail Address"
        isRequired
        requiredType="asterisk"
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        // autoFocus={true}
        returnKeyType="next"
        onSubmitEditing={() => {}}
        style={styles.input}
      />

      <Spacer size={16} vertical />
      <TextInput
        label="Password"
        isRequired
        requiredType="asterisk"
        placeholder="Enter your password"
        keyboardType="default"
        autoCapitalize="none"
        autoComplete="password"
        autoCorrect={false}
        secureTextEntry={true}
        returnKeyType="done"
        onSubmitEditing={() => {}}
        style={styles.input}
      />
      </KeyboardAwareScrollView>
      <KeyboardToolbar />
    </>
  );
};

export default LogInScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16
  },
  link: {
    color: '#FF2E92',
    textDecorationLine: 'underline',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    marginTop: 4
  },
});
