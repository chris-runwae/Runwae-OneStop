import { Image } from "react-native";

interface OAuthProvider {
  name: string;
  icon: string | React.ReactNode;
  color?: string;
}

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
    icon: (
      <Image
        source={require("@/assets/images/apple-icon.png")}
        className="dark:invert"
        style={{ width: 20, height: 20, resizeMode: "contain" }}
      />
    ),
  },
];
