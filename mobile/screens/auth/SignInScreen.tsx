// import React, { useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   KeyboardAvoidingView,
//   Platform,
//   TouchableOpacity,
//   Alert,
//   useColorScheme,
// } from 'react-native';
// import { useSignIn } from '@clerk/clerk-expo';
// import { useRouter, Link } from 'expo-router';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { AuthInput } from '@/components/auth/AuthInput';
// import { AuthButton } from '@/components/auth/AuthButton';
// import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
// import { Colors } from '@/constants';
// import { textStyles } from '@/utils/styles';

// export function SignInScreen() {
//   const colorScheme = useColorScheme() ?? 'light';
//   const colors = Colors[colorScheme];
//   const router = useRouter();
//   const { signIn, setActive, isLoaded } = useSignIn();

//   const [emailOrUsername, setEmailOrUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [magicLinkLoading, setMagicLinkLoading] = useState(false);
//   const [errors, setErrors] = useState<{
//     email?: string;
//     password?: string;
//     general?: string;
//   }>({});

//   const validateEmail = (email: string): boolean => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const handleSignIn = useCallback(async () => {
//     if (!isLoaded) return;

//     setErrors({});

//     if (!emailOrUsername.trim()) {
//       setErrors({ email: 'Email or username is required' });
//       return;
//     }

//     if (!password || password.length < 8) {
//       setErrors({ password: 'Password must be at least 8 characters' });
//       return;
//     }

//     setLoading(true);
//     try {
//       console.log(
//         '[SignIn] Attempting sign in with identifier:',
//         emailOrUsername
//       );
//       const result = await signIn.create({
//         identifier: emailOrUsername,
//         password,
//       });

//       if (result.status === 'complete') {
//         console.log('[SignIn] Sign in successful');
//         await setActive({ session: result.createdSessionId });
//         router.replace('/(tabs)');
//       } else {
//         console.log('[SignIn] Sign in incomplete, status:', result.status);
//         setErrors({ general: 'Sign in incomplete. Please try again.' });
//       }
//     } catch (error: any) {
//       console.error('[SignIn] Error:', error);
//       const clerkError = error?.errors?.[0];
//       if (clerkError) {
//         if (clerkError.code === 'form_identifier_not_found') {
//           setErrors({ email: 'No account found with this email or username' });
//         } else if (clerkError.code === 'form_password_incorrect') {
//           setErrors({ password: 'Incorrect password' });
//         } else {
//           setErrors({ general: clerkError.message || 'Failed to sign in' });
//         }
//       } else {
//         setErrors({ general: 'An unexpected error occurred' });
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [isLoaded, emailOrUsername, password, signIn, setActive, router]);

//   const handleMagicLink = useCallback(async () => {
//     if (!isLoaded) return;

//     setErrors({});

//     if (!emailOrUsername.trim() || !validateEmail(emailOrUsername)) {
//       setErrors({ email: 'Please enter a valid email address for magic link' });
//       return;
//     }

//     setMagicLinkLoading(true);
//     try {
//       console.log('[SignIn] Sending magic link to:', emailOrUsername);
//       await signIn.create({
//         identifier: emailOrUsername,
//         strategy: 'email_link',
//         redirectUrl: 'myapp://sign-in-callback',
//       });

//       router.push({
//         pathname: '/(auth)/email-sent',
//         params: { email: emailOrUsername, type: 'magic-link' },
//       });
//     } catch (error: any) {
//       console.error('[SignIn] Magic link error:', error);
//       const clerkError = error?.errors?.[0];
//       setErrors({
//         general: clerkError?.message || 'Failed to send magic link',
//       });
//     } finally {
//       setMagicLinkLoading(false);
//     }
//   }, [isLoaded, emailOrUsername, signIn, router]);

//   const handleOAuthSuccess = useCallback(() => {
//     console.log('[SignIn] OAuth success, navigating to tabs');
//     router.replace('/(tabs)');
//   }, [router]);

//   const handleOAuthError = useCallback((error: string) => {
//     console.error('[SignIn] OAuth error:', error);
//     Alert.alert('Sign In Error', error);
//   }, []);

//   return (
//     <SafeAreaView
//       style={[styles.container, { backgroundColor: colors.background }]}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.keyboardView}>
//         <ScrollView
//           contentContainerStyle={styles.scrollContent}
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled">
//           <View style={styles.header}>
//             <Text style={[styles.title, textStyles.h1, { color: colors.text }]}>
//               Welcome back
//             </Text>
//             <Text
//               style={[
//                 styles.subtitle,
//                 textStyles.body,
//                 { color: colors.textColors.subtitle },
//               ]}>
//               Sign in to continue to your account
//             </Text>
//           </View>

//           {errors.general && (
//             <View
//               style={[
//                 styles.errorBanner,
//                 { backgroundColor: colors.destructiveColors.background },
//               ]}>
//               <Text
//                 style={[
//                   textStyles.bodySmall,
//                   { color: colors.destructiveColors.default },
//                 ]}>
//                 {errors.general}
//               </Text>
//             </View>
//           )}

//           <View style={styles.form}>
//             <AuthInput
//               label="Email or Username"
//               placeholder="Enter your email or username"
//               value={emailOrUsername}
//               onChangeText={setEmailOrUsername}
//               keyboardType="email-address"
//               autoComplete="email"
//               error={errors.email}
//             />

//             <AuthInput
//               label="Password"
//               placeholder="Enter your password"
//               value={password}
//               onChangeText={setPassword}
//               isPassword
//               autoComplete="password"
//               error={errors.password}
//             />

//             <Link href="/(auth)/forgot-password" asChild>
//               <TouchableOpacity style={styles.forgotPassword}>
//                 <Text style={[textStyles.bodySmall, { color: colors.primary }]}>
//                   Forgot password?
//                 </Text>
//               </TouchableOpacity>
//             </Link>

//             <AuthButton
//               title="Sign In"
//               onPress={handleSignIn}
//               loading={loading}
//               disabled={!emailOrUsername || !password}
//             />

//             <AuthButton
//               title="Sign in with Magic Link"
//               variant="secondary"
//               onPress={handleMagicLink}
//               loading={magicLinkLoading}
//               disabled={!emailOrUsername || !validateEmail(emailOrUsername)}
//               style={styles.magicLinkButton}
//             />
//           </View>

//           <SocialAuthButtons
//             onSuccess={handleOAuthSuccess}
//             onError={handleOAuthError}
//           />

//           <View style={styles.footer}>
//             <Text
//               style={[textStyles.body, { color: colors.textColors.subtitle }]}>
//               Do not have an account?{' '}
//             </Text>
//             <Link href="/(auth)/sign-up" asChild>
//               <TouchableOpacity>
//                 <Text
//                   style={[
//                     textStyles.body,
//                     { color: colors.primary, fontWeight: '600' as const },
//                   ]}>
//                   Sign Up
//                 </Text>
//               </TouchableOpacity>
//             </Link>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   keyboardView: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//     paddingHorizontal: 24,
//     paddingTop: 40,
//     paddingBottom: 24,
//   },
//   header: {
//     marginBottom: 32,
//   },
//   title: {
//     marginBottom: 8,
//   },
//   subtitle: {},
//   errorBanner: {
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   form: {
//     gap: 4,
//   },
//   forgotPassword: {
//     alignSelf: 'flex-end',
//     marginBottom: 24,
//     marginTop: 4,
//   },
//   magicLinkButton: {
//     marginTop: 12,
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 32,
//   },
// });


import { isClerkAPIResponseError, useSignIn } from '@clerk/clerk-expo';
import { ClerkAPIError } from '@clerk/types';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { useState } from 'react';
import {
  StyleSheet,
  View,
  useColorScheme,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import { Spacer, Text, Button } from '@/components';
import ScreenContainer from '@/components/containers/ScreenContainer';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';

// const darkLogo = require('@/assets/images/icon-dark.png');
const lightLogo = require('@/assets/images/icon.png');

export function SignInScreen() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errors, setErrors] = useState<ClerkAPIError[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const styles = StyleSheet.create({
    contentContainer: {
      gap: 4,
      flex: 1,
      paddingHorizontal: 16,
      // backgroundColor: colors.backgroundColors.default,
      // backgroundColor: Colors[colorScheme].white,
    },
    headerContainer: {
      borderBottomWidth: 0,
    },
    inputContainer: {
      // gap: 10,
    },
    textInputContainer: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderGray,
      borderRadius: 12,
      padding: 12,
      ...textStyles.body_Regular,
      color: colors.textColors.default,
    },

    logo: {
      width: 20,
      height: 30,
    },
    text: {
      color: colors.textColors.default,
    },
    body: {
      color: colors.textColors.default,
      fontSize: 12,
      lineHeight: 14,
    },
    routeContainer: {
      alignSelf: 'center',
    },
    errorText: {
      color: 'red',
      marginBottom: 8,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    passwordInput: {
      flex: 1,
    },

    // Text
    headerText: {
      ...textStyles.bold_20,
      fontSize: 24,
      lineHeight: 30,
    },
    descriptionText: {
      ...textStyles.subtitle_Regular,
      fontSize: 16,
      color: Colors[colorScheme].borderColors.default,
    },
    subtitleText: {
      ...textStyles.body_Bold, //Add DM Sans semiBold font family here
      fontSize: 13,
      lineHeight: 19.5,
    },
    linkText: {
      color: colors.primaryColors.default,
      textDecorationLine: 'underline',
    },
    routeText: {
      color: Colors[colorScheme].textBlack,
    },
  });

  if (!isLoaded) {
    return null;
  }

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    setIsSigningIn(true);
    setErrors([]);

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({
          session: signInAttempt.createdSessionId,
        });
        router.replace('/(tabs)');
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      if (isClerkAPIResponseError(err)) setErrors(err.errors);
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <>
      <ScreenContainer
        style={styles.headerContainer}
        header={{
          rightComponent: <View />,
          leftComponent: (
            <Image
              // source={colorScheme === 'dark' ? darkLogo : lightLogo} //TODO: Uncomment this when dark mode is implemented
              source={lightLogo}
              style={styles.logo}
              contentFit="contain"
            />
          ),
        }}>
        <View style={styles.contentContainer}>
          <Spacer size={8} vertical />
          <Text style={styles.headerText}>Welcome Back!</Text>
          <Text style={styles.descriptionText}>
            Enter your details to proceed or{' '}
            <Link href="/(auth)/sign-up" asChild>
              <Text style={styles.linkText}>sign up</Text>
            </Link>{' '}
            here.
          </Text>
          <Spacer size={24} vertical />

          <View style={styles.inputContainer}>
            <Text style={styles.subtitleText}>Email Address</Text>
            <TextInput
              textContentType="emailAddress"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              style={styles.textInputContainer}
              placeholder="johndoe@gmail.com"
              placeholderTextColor={colors.borderColors.subtle}
            />
            <Spacer size={10} vertical />
            <Text style={styles.subtitleText}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={[styles.textInputContainer, styles.passwordInput]}
                placeholder="********"
                placeholderTextColor={colors.borderColors.subtle}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeIcon
                    size={24}
                    color={Colors[colorScheme].iconBorderGrey}
                  />
                ) : (
                  <EyeOffIcon
                    size={24}
                    color={Colors[colorScheme].iconBorderGrey}
                  />
                )}
              </TouchableOpacity>
            </View>
            {errors.map((error) => (
              <Text key={error.longMessage} style={styles.errorText}>
                {error.longMessage}
              </Text>
            ))}
          </View>

          <Spacer size={24} vertical />
          <Button
            onPress={onSignInPress}
            variant="filled"
            disabled={email === '' || password === ''}
            loading={isSigningIn}
            textStyle={{ color: colors.white }}>
            Sign In
          </Button>
          <Spacer size={30} vertical />

          {/* <Link
            href="/(auth)/reset-password"
            asChild
            style={styles.routeContainer}>
            <Text style={styles.linkText}>Forgot your password?</Text>
          </Link> */}
        </View>
      </ScreenContainer>
    </>
  );
};