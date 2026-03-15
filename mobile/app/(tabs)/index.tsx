import WelcomeModal from "@/components/WelcomeModal";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import AppSafeAreaView from "@/components/ui/AppSafeAreaView";

export default function HomeScreen() {
  const { signOut, hasCompletedBoarding, completeBoarding } = useAuth();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    console.log(
      "HomeScreen useEffect - hasCompletedBoarding:",
      hasCompletedBoarding,
    );
    if (!hasCompletedBoarding) {
      setShowWelcomeModal(true);
      console.log("Showing welcome modal");
    } else {
      setShowWelcomeModal(false);
      console.log("Hiding welcome modal");
    }
  }, [hasCompletedBoarding]);

  const handleCloseWelcomeModal = async () => {
    await completeBoarding();
    setShowWelcomeModal(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <AppSafeAreaView className="items-center justify-center">
      <Text className="text-2xl font-bold mb-8 dark:text-white">Home</Text>
      <Pressable
        onPress={handleSignOut}
        className="bg-red-500 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Sign Out</Text>
      </Pressable>

      <WelcomeModal
        visible={showWelcomeModal}
        onClose={handleCloseWelcomeModal}
      />
    </AppSafeAreaView>
  );
}
