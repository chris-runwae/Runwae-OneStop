// import { isClerkAPIResponseError, useSignIn } from '@clerk/clerk-expo';
// import { ClerkAPIError } from '@clerk/types';
// import { Image } from 'expo-image';
// import { Link, useRouter } from 'expo-router';
// import { EyeIcon, EyeOffIcon } from 'lucide-react-native';
// import { useState } from 'react';
// import {
//   StyleSheet,
//   View,
//   useColorScheme,
//   TextInput,
//   TouchableOpacity,
// } from 'react-native';

// import { Spacer, Text, Button } from '@/components';
// import ScreenContainer from '@/components/containers/ScreenContainer';
// import { Colors } from '@/constants';
// import { textStyles } from '@/utils/styles';

// // const darkLogo = require('@/assets/images/icon-dark.png');
// const lightLogo = require('@/assets/images/icon.png');

// const SignInScreen = () => {
//   const router = useRouter();
//   const { signIn, setActive, isLoaded } = useSignIn();
//   const colorScheme = useColorScheme() ?? 'light';
//   const colors = Colors[colorScheme];

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isSigningIn, setIsSigningIn] = useState(false);
//   const [errors, setErrors] = useState<ClerkAPIError[]>([]);
//   const [showPassword, setShowPassword] = useState(false);

//   const styles = StyleSheet.create({
//     contentContainer: {
//       gap: 4,
//       flex: 1,
//       paddingHorizontal: 16,
//       // backgroundColor: colors.backgroundColors.default,
//       // backgroundColor: Colors[colorScheme].white,
//     },
//     headerContainer: {
//       borderBottomWidth: 0,
//     },
//     inputContainer: {
//       // gap: 10,
//     },
//     textInputContainer: {
//       borderWidth: 1,
//       borderColor: Colors[colorScheme].borderGray,
//       borderRadius: 12,
//       padding: 12,
//       ...textStyles.body_Regular,
//       color: colors.textColors.default,
//     },

//     logo: {
//       width: 20,
//       height: 30,
//     },
//     text: {
//       color: colors.textColors.default,
//     },
//     body: {
//       color: colors.textColors.default,
//       fontSize: 12,
//       lineHeight: 14,
//     },
//     routeContainer: {
//       alignSelf: 'center',
//     },
//     errorText: {
//       color: 'red',
//       marginBottom: 8,
//     },
//     passwordContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: 8,
//     },
//     passwordInput: {
//       flex: 1,
//     },

//     // Text
//     headerText: {
//       ...textStyles.bold_20,
//       fontSize: 24,
//       lineHeight: 30,
//     },
//     descriptionText: {
//       ...textStyles.subtitle_Regular,
//       fontSize: 16,
//       color: Colors[colorScheme].borderColors.default,
//     },
//     subtitleText: {
//       ...textStyles.body_Bold, //Add DM Sans semiBold font family here
//       fontSize: 13,
//       lineHeight: 19.5,
//     },
//     linkText: {
//       color: colors.primaryColors.default,
//       textDecorationLine: 'underline',
//     },
//     routeText: {
//       color: Colors[colorScheme].textBlack,
//     },
//   });

//   if (!isLoaded) {
//     return null;
//   }

//   // Handle the submission of the sign-in form
//   const onSignInPress = async () => {
//     if (!isLoaded) return;

//     setIsSigningIn(true);
//     setErrors([]);

//     // Start the sign-in process using the email and password provided
//     try {
//       const signInAttempt = await signIn.create({
//         identifier: email,
//         password,
//       });

//       // If sign-in process is complete, set the created session as active
//       // and redirect the user
//       if (signInAttempt.status === 'complete') {
//         await setActive({
//           session: signInAttempt.createdSessionId,
//         });
//         router.replace('/(tabs)');
//       } else {
//         // If the status isn't complete, check why. User might need to
//         // complete further steps.
//         console.error(JSON.stringify(signInAttempt, null, 2));
//       }
//     } catch (err) {
//       // See https://clerk.com/docs/custom-flows/error-handling
//       // for more info on error handling
//       if (isClerkAPIResponseError(err)) setErrors(err.errors);
//       console.error(JSON.stringify(err, null, 2));
//     } finally {
//       setIsSigningIn(false);
//     }
//   };

//   return (
//     <>
//       <ScreenContainer
//         style={styles.headerContainer}
//         header={{
//           rightComponent: <View />,
//           leftComponent: (
//             <Image
//               // source={colorScheme === 'dark' ? darkLogo : lightLogo} //TODO: Uncomment this when dark mode is implemented
//               source={lightLogo}
//               style={styles.logo}
//               contentFit="contain"
//             />
//           ),
//         }}>
//         <View style={styles.contentContainer}>
//           <Spacer size={8} vertical />
//           <Text style={styles.headerText}>Welcome Back!</Text>
//           <Text style={styles.descriptionText}>
//             Enter your details to proceed or{' '}
//             <Link href="/(auth)/sign-up" asChild>
//               <Text style={styles.linkText}>sign up</Text>
//             </Link>{' '}
//             here.
//           </Text>
//           <Spacer size={24} vertical />

//           <View style={styles.inputContainer}>
//             <Text style={styles.subtitleText}>Email Address</Text>
//             <TextInput
//               textContentType="emailAddress"
//               autoCapitalize="none"
//               value={email}
//               onChangeText={setEmail}
//               style={styles.textInputContainer}
//               placeholder="johndoe@gmail.com"
//               placeholderTextColor={colors.borderColors.subtle}
//             />
//             <Spacer size={10} vertical />
//             <Text style={styles.subtitleText}>Password</Text>
//             <View style={styles.passwordContainer}>
//               <TextInput
//                 value={password}
//                 onChangeText={setPassword}
//                 secureTextEntry={!showPassword}
//                 style={[styles.textInputContainer, styles.passwordInput]}
//                 placeholder="********"
//                 placeholderTextColor={colors.borderColors.subtle}
//               />
//               <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//                 {showPassword ? (
//                   <EyeIcon
//                     size={24}
//                     color={Colors[colorScheme].iconBorderGrey}
//                   />
//                 ) : (
//                   <EyeOffIcon
//                     size={24}
//                     color={Colors[colorScheme].iconBorderGrey}
//                   />
//                 )}
//               </TouchableOpacity>
//             </View>
//             {errors.map((error) => (
//               <Text key={error.longMessage} style={styles.errorText}>
//                 {error.longMessage}
//               </Text>
//             ))}
//           </View>

//           <Spacer size={24} vertical />
//           <Button
//             onPress={onSignInPress}
//             variant="filled"
//             disabled={email === '' || password === ''}
//             loading={isSigningIn}
//             textStyle={{ color: colors.white }}>
//             Sign In
//           </Button>
//           <Spacer size={30} vertical />

//           {/* <Link
//             href="/(auth)/reset-password"
//             asChild
//             style={styles.routeContainer}>
//             <Text style={styles.linkText}>Forgot your password?</Text>
//           </Link> */}
//         </View>
//       </ScreenContainer>
//     </>
//   );
// };

// export default SignInScreen;

import { SignInScreen } from '@/screens/auth/SignInScreen';

export default function SignIn() {
  return <SignInScreen />;
}
