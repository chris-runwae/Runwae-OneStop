import React from 'react';
import { View, StyleSheet, Text, Platform, useColorScheme } from 'react-native';
import { useSSO } from '@clerk/clerk-expo';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { AuthButton } from './AuthButton';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';
import { useRouter } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

interface SocialAuthButtonsProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function SocialAuthButtons({
  onSuccess,
  onError,
}: SocialAuthButtonsProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  if (!colors) {
    throw new Error('Invalid color scheme');
  }
  const dividerColor = colors.borderColors.subtle;
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    // try {
    //   console.log('[OAuth] Starting Google sign in');
    //   const { createdSessionId, setActive } = await startGoogleOAuth({
    //     redirectUrl: Linking.createURL('/(tabs)', { scheme: 'io.runwae.app' }),
    //   });

    //   if (createdSessionId && setActive) {
    //     console.log(
    //       '[OAuth] Google sign in successful, setting active session'
    //     );
    //     await setActive({ session: createdSessionId });
    //     onSuccess?.();
    //   }
    // } catch (error: any) {
    //   console.error('[OAuth] Google sign in error:', error);
    //   onError?.(error?.errors?.[0]?.message || 'Failed to sign in with Google');
    // }

    try {
      // Start the authentication process by calling `startSSOFlow()`
      const { createdSessionId, setActive, signIn, signUp } =
        await startSSOFlow({
          strategy: 'oauth_google',
          // For web, defaults to current path
          // For native, you must pass a scheme, like AuthSession.makeRedirectUri({ scheme, path })
          // For more info, see https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions
          redirectUrl: AuthSession.makeRedirectUri(),
        });

      // If sign in was successful, set the active session
      if (createdSessionId) {
        setActive!({
          session: createdSessionId,
          // Check for session tasks and navigate to custom UI to help users resolve them
          // See https://clerk.com/docs/guides/development/custom-flows/overview#session-tasks
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              // router.push('/sign-in/tasks');
              // router.push('/(tabs)');
              return;
            }

            console.log('Navigating to /');
            router.replace('/(tabs)');
          },
        });
      } else {
        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // See https://clerk.com/docs/guides/development/custom-flows/authentication/oauth-connections#handle-missing-requirements
        console.log(
          'No createdSessionId, there are missing requirements, such as MFA'
        );
      }
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // const handleAppleSignIn = async () => {
  //   try {
  //     console.log('[OAuth] Starting Apple sign in');
  //     const { createdSessionId, setActive } = await startAppleOAuth({
  //       redirectUrl: Linking.createURL('/(tabs)', { scheme: 'io.runwae.app' }),
  //     });

  //     if (createdSessionId && setActive) {
  //       console.log('[OAuth] Apple sign in successful, setting active session');
  //       await setActive({ session: createdSessionId });
  //       onSuccess?.();
  //     }
  //   } catch (error: any) {
  //     console.error('[OAuth] Apple sign in error:', error);
  //     onError?.(error?.errors?.[0]?.message || 'Failed to sign in with Apple');
  //   }
  // };

  return (
    <View style={styles.container}>
      <View style={styles.dividerContainer}>
        <View style={[styles.divider, { backgroundColor: dividerColor }]} />
        <Text
          style={[
            styles.dividerText,
            textStyles.caption,
            { color: colors.textColors.subtitle },
          ]}>
          or continue with
        </Text>
        <View style={[styles.divider, { backgroundColor: dividerColor }]} />
      </View>

      <View style={styles.buttonsContainer}>
        <AuthButton
          title="Google"
          variant="outline"
          onPress={handleGoogleSignIn}
          style={styles.socialButton}
          icon={
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.primaryColors.default },
              ]}>
              <Text style={styles.iconText}>G</Text>
            </View>
          }
        />
        {Platform.OS !== 'web' && (
          <AuthButton
            title="Apple"
            variant="outline"
            onPress={handleGoogleSignIn}
            style={styles.socialButton}
            icon={
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.primaryColors.default },
                ]}>
                <Text style={[styles.iconText, { color: colors.white }]}></Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
  },
  buttonsContainer: {
    gap: 12,
  },
  socialButton: {
    borderRadius: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
