import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import {
  Instagram,
  Linkedin,
  Mail,
  Newspaper,
  Phone,
  Twitter,
} from "lucide-react-native";

export const CONTACT_ITEMS = [
  {
    title: "Phone Number",
    icon: <Phone size={15} color="#343A40" />,
    badge: true,
    badgeText: "Call now",
    onPress: () => Linking.openURL("tel:+1234567890"),
  },
  {
    title: "Email Address",
    icon: <Mail size={15} color="#343A40" />,
    badge: true,
    badgeText: "Copy",
    onPress: async () => {
      await Clipboard.setStringAsync("support@runwae.com");
    },
  },
  {
    title: "Instagram",
    icon: <Instagram size={15} color="#343A40" />,
    onPress: () => Linking.openURL("https://www.instagram.com/runwae"),
  },
  {
    title: "Twitter",
    icon: <Twitter size={15} color="#343A40" />,
    onPress: () => Linking.openURL("https://x.com/runwae"),
  },
  {
    title: "LinkedIn",
    icon: <Linkedin size={15} strokeWidth={1.5} color="#343A40" />,
    onPress: () => Linking.openURL("https://www.linkedin.com/company/runwae"),
  },
  {
    title: "Our Blog",
    icon: <Newspaper size={15} color="#343A40" />,
    onPress: () => Linking.openURL("https://runwae.com/blog"),
  },
];
