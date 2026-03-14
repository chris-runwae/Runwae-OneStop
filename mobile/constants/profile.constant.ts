import {
  ArrowRightFromLine,
  BrushCleaning,
  Lock,
  MessageCircleQuestionMark,
} from "lucide-react-native";

interface MOCK_REWARDS_PROPS {
  value: number | string;
  label: string;
}

interface MENU_OPTIONS_PROPS {
  title: string;
  route: string;
  icon: React.ComponentType<{
    size: number;
    color: string;
    className?: string;
    strokeWidth?: number;
  }>;
}

export const MOCK_REWARDS: MOCK_REWARDS_PROPS[] = [
  {
    value: 0,
    label: "Points",
  },
  {
    value: 0,
    label: "Badges",
  },
  {
    value: 0,
    label: "Stamps",
  },
];

export const MENU_OPTIONS: MENU_OPTIONS_PROPS[] = [
  {
    title: "Get Help",
    route: "/profile/support",
    icon: MessageCircleQuestionMark,
  },
  {
    title: "Appearance",
    route: "/profile/appearance",
    icon: BrushCleaning,
  },
  {
    title: "Security",
    route: "/profile/security",
    icon: Lock,
  },
  {
    title: "Legal",
    route: "/legal",
    icon: ArrowRightFromLine,
  },
];
