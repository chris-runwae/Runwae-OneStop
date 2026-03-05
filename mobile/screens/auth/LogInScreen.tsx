import {
  Alert,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import { Link, router } from 'expo-router';
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacer, TextInput } from '@/components';
import { useAuth } from '@/context/AuthContext';

const LogInScreen = () => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
    }

    if (password.length < 3) {
      Alert.alert('Error', 'Password must be at least 3 characters');
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      router.push('/(tabs)');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <KeyboardAwareScrollView
        bottomOffset={62}
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 24 },
        ]}>
        <Spacer size={24} vertical />
        <Text>Welcome to Runwae🎉</Text>
        <Spacer size={24} vertical />

        <Text>
          Login to your account or{' '}
          <Link href="/(auth)/signup" style={styles.link}>
            sign up
          </Link>{' '}
          here.
        </Text>
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
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          {isLoading ? (
            <ActivityIndicator size={24} color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
      <KeyboardToolbar />
    </>
  );
};

export default LogInScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
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
    marginTop: 4,
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
