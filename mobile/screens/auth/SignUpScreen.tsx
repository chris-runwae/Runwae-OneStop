import {  ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { Link, useRouter } from "expo-router";
import { KeyboardAwareScrollView, KeyboardToolbar } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacer, TextInput } from "@/components";
import { useAuth } from "@/context/AuthContext";

const SignUpScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
    }

    if (password.length < 3) {
      Alert.alert("Error", "Password must be at least 3 characters");
    }

    setIsLoading(true);
    try {
      await signUp(email, password);
      router.push("/(auth)/onboarding");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to sign up. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <KeyboardAwareScrollView 
        bottomOffset={162} 
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 24 }]}
        >
      <Spacer size={24} vertical />
      <Text>Welcome to Runwae🎉</Text>
      <Spacer size={24} vertical />

      <Text>Create an account or <Link href="/(auth)/login" style={styles.link}>log in</Link> here.</Text>
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
        autoFocus={true}
        returnKeyType="next"
        onChangeText={setEmail}
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
        onChangeText={setPassword}
        style={styles.input}
      />


      <Spacer size={40} vertical />
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        {isLoading ? (
          <ActivityIndicator size={24} color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => router.push("/(auth)/signup")}
      >
        <Text style={styles.linkButtonText}>
          Already have an account?{" "}
          <Text style={styles.linkButtonTextBold}>Sign In</Text>
        </Text>
      </TouchableOpacity>


      </KeyboardAwareScrollView>
      <KeyboardToolbar />
    </>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 40
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

  button: {
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkButton: {
    marginTop: 24,
    alignItems: "center",
  },
  linkButtonText: {
    color: "#666",
    fontSize: 14,
  },
  linkButtonTextBold: {
    fontWeight: "600",
    color: "#000",
  },
});
