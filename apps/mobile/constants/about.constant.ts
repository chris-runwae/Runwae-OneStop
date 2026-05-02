import {
  Facebook,
  FileText,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react-native";

export const ABOUT_ITEMS = [
  {
    title: "Our Story",
    subtitle: "Why Runwae exists",
    route: "/profile/about/our-story",
  },
  {
    title: "Connect with Us",
    subtitle: "Connect with us on social media.",
    route: "/profile/about/connect-with-us",
  },
  {
    title: "Terms & Policies",
    subtitle: "Find the details that keep everything running smoothly.",
    route: "/profile/about/terms-policies",
  },
];

export const POLICY_SECTIONS = [
  {
    title: "Terms of Use",
    route: "/profile/about/terms-of-service",
  },
  {
    title: "Privacy Policy",
    route: "/profile/about/privacy-policy",
  },
  {
    title: "Cookie Policy",
    route: "/profile/about/cookie-policy",
  },
];

export const SOCIAL_LINKS = [
  {
    name: "Instagram",
    handle: "@runwae.app",
    icon: Instagram,
    color: "#E1306C",
    url: "https://www.instagram.com/runwae.app",
  },
  {
    name: "Twitter",
    handle: "@runwae",
    icon: Twitter,
    color: "#000000",
    url: "https://twitter.com/runwae",
  },
  {
    name: "LinkedIn",
    handle: "Runwae",
    icon: Linkedin,
    color: "#0A66C2",
    url: "https://www.linkedin.com/company/runwae",
  },
  {
    name: "Facebook",
    handle: "Runwae",
    icon: Facebook,
    color: "#0A66C2",
    url: "https://www.facebook.com/runwae",
  },
  {
    name: "Our Blog",
    handle: "",
    icon: FileText,
    color: "#5865F2",
    url: "https://blog.runwae.com",
  },
];
