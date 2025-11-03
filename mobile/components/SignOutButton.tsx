import { useClerk } from "@clerk/clerk-expo";
import { useRouter, RelativePathString } from "expo-router";
import { Button } from "react-native";

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("Signed out successfully");
      // Redirect to your desired page
      router.replace("/(auth)/sign-in" as RelativePathString);
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return <Button title="Sign out" onPress={handleSignOut} />;
};
