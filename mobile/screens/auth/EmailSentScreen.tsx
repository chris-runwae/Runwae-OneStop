import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { AuthButton } from '@/components/auth/AuthButton';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';

export function EmailSentScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  if (!colors) {
    throw new Error('Invalid color scheme');
  }

  const router = useRouter();
  const { email, type } = useLocalSearchParams<{
    email: string;
    type: string;
  }>();

  const title =
    type === 'magic-link' ? 'Check your email' : 'Verification sent';
  const description =
    type === 'magic-link'
      ? `We sent a magic link to ${email}. Click the link in the email to sign in.`
      : `We sent a verification email to ${email}. Please check your inbox.`;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ArrowLeft size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.primaryColors.background },
          ]}>
          <Mail size={48} color={colors.primaryColors.default} />
        </View>

        <Text style={[styles.title, textStyles.h2, { color: colors.text }]}>
          {title}
        </Text>

        <Text
          style={[
            styles.description,
            textStyles.body,
            { color: colors.textColors.subtitle },
          ]}>
          {description}
        </Text>

        <View style={styles.infoBox}>
          <Text
            style={[
              textStyles.bodySmall,
              { color: colors.textColors.subtitle },
            ]}>
            Did not receive the email? Check your spam folder or try again.
          </Text>
        </View>

        <AuthButton
          title="Back to Sign In"
          onPress={() => router.replace('/(auth)/sign-in')}
          style={styles.button}
        />

        <AuthButton
          title="Open Email App"
          variant="outline"
          onPress={() => {
            console.log('[EmailSent] Open email app requested');
          }}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  infoBox: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  button: {
    width: '100%',
    marginBottom: 12,
  },
});
