import * as React from 'react';
import {
  Alert,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { Href, Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacer, Text, TextInput } from '@/components';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';

export default function SignUpScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState('');
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  // const [confirmPassword, setConfirmPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    setLoading(true);
    console.log(emailAddress, password);

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
      Alert.alert(
        'Something went wrong.',
        `${(err as any)?.errors?.[0]?.longMessage}` || 'Please try again.',
        [{ text: 'OK', onPress: () => {} }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace('/');
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  if (pendingVerification) {
    return (
      <>
        <Text>Verify your email</Text>
        <TextInput
          value={code}
          placeholder="Enter your verification code"
          onChangeText={(code) => setCode(code)}
        />
        <TouchableOpacity onPress={onVerifyPress}>
          <Text>Verify</Text>
        </TouchableOpacity>
      </>
    );
  }

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.backgroundColors.default,
      paddingTop: insets.top + 32,
    },
    primaryButton: {
      backgroundColor: colors.primaryColors.default,
      paddingVertical: 12,
      height: 48,
      paddingHorizontal: 24,
      borderRadius: 12,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },

    linkText: {
      color: colors.primaryColors.default,
      textDecorationLine: 'underline',
    },
    descriptionText: {
      ...textStyles.subtitle_Regular,
      fontSize: 16,
      color: colors.textColors.subtitle,
    },
    labelStyle: {
      ...textStyles.body_Regular,
      fontSize: 14,
    },
    buttonText: {
      ...textStyles.body_Regular,
      color: colors.white,
      fontSize: 16,
    },
  });

  return (
    <View style={[dynamicStyles.container, styles.container]}>
      <Text style={styles.headerText}>Welcome to Runwae🎉</Text>
      <Spacer size={4} vertical />
      <Text style={dynamicStyles.descriptionText}>
        Create an account to proceed or{' '}
        <Link href={'/(auth)/sign-in' as Href}>
          <Text style={dynamicStyles.linkText}>log in</Text>
        </Link>{' '}
        here.
      </Text>
      <Spacer size={32} vertical />

      {/* FORM */}
      <View style={styles.formContainer}>
        <TextInput
          autoCapitalize="none"
          value={name}
          placeholder="Enter name"
          onChangeText={(name) => setName(name)}
          // style={styles.textInput}
          label="Name"
          labelStyle={dynamicStyles.labelStyle}
          isRequired={true}
          requiredType="asterisk"
        />
        <TextInput
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          onChangeText={(email) => setEmailAddress(email)}
          label="Email Address"
          labelStyle={dynamicStyles.labelStyle}
          isRequired={true}
          requiredType="asterisk"
        />
        <TextInput
          value={password}
          placeholder="Enter password"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
          label="Password"
          labelStyle={dynamicStyles.labelStyle}
          isRequired={true}
          requiredType="asterisk"
        />
        {/* <TextInput
          value={confirmPassword}
          placeholder="Confirm password"
          secureTextEntry={true}
          onChangeText={(confirmPassword) =>
            setConfirmPassword(confirmPassword)
          }
          label="Confirm Password"
          labelStyle={dynamicStyles.labelStyle}
          isRequired={true}
        /> */}
      </View>

      <Spacer size={24} vertical />
      <TouchableOpacity
        onPress={onSignUpPress}
        style={dynamicStyles.primaryButton}>
        <Text style={dynamicStyles.buttonText}>Continue</Text>
        {loading && <ActivityIndicator size="small" color={colors.white} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formContainer: {
    gap: 24,
  },

  headerText: {
    ...textStyles.bold_20,
    fontSize: 24,
    lineHeight: 30,
    maxWidth: 140,
  },
});
