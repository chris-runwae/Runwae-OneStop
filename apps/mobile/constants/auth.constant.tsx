import { Image, useColorScheme } from "react-native";
import React from "react";

interface OAuthProvider {
  name: string;
  icon: string | React.ReactNode;
  color?: string;
}

const AppleIconComponent = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Image
      source={
        isDark
          ? require("@/assets/images/app-icon-light.png")
          : require("@/assets/images/apple-icon.png")
      }
      style={{ width: 20, height: 20, resizeMode: "contain" }}
    />
  );
};

export const OAuthProviderData: OAuthProvider[] = [
  {
    name: "google",
    icon: (
      <Image
        source={require("@/assets/images/google-icon.png")}
        style={{ width: 20, height: 20, resizeMode: "contain" }}
      />
    ),
  },
  {
    name: "facebook",
    icon: (
      <Image
        source={require("@/assets/images/facebook-icon.png")}
        style={{ width: 20, height: 20, resizeMode: "contain" }}
      />
    ),
  },
  {
    name: "apple",
    icon: <AppleIconComponent />,
  },
];
