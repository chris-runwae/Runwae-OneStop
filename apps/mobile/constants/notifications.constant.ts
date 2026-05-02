import { Info, LucideIcon, Trophy } from "lucide-react-native";

export interface Notification {
  id: string;
  type: "social" | "system";
  user?: {
    name: string;
    avatar: string;
  };
  action?: string;
  subject?: string;
  title?: string;
  message?: string;
  icon?: LucideIcon;
  time: string;
  thumbnail?: string;
  isRead: boolean;
}

export const FOR_YOU_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "social",
    user: {
      name: "Stella Ama",
      avatar: "https://i.pravatar.cc/150?u=stella",
    },
    action: "added you to a trip -",
    subject: "DETTY DECEMBER",
    time: "a second ago",
    thumbnail: "https://picsum.photos/200/200?random=1",
    isRead: false,
  },
  {
    id: "2",
    type: "social",
    user: {
      name: "Jamie Silver",
      avatar: "https://i.pravatar.cc/150?u=jamie",
    },
    action: "sent you a co leader request",
    subject: "",
    time: "10 minutes ago",
    thumbnail: "https://picsum.photos/200/200?random=2",
    isRead: false,
  },
  {
    id: "3",
    type: "social",
    user: {
      name: "John Notes",
      avatar: "https://i.pravatar.cc/150?u=john",
    },
    action: "replied to your comment on",
    subject: "Birthday! - 'yayy'",
    time: "5 hours ago",
    thumbnail: "https://picsum.photos/200/200?random=3",
    isRead: false,
  },
  {
    id: "4",
    type: "social",
    user: {
      name: "Liam Chen",
      avatar: "https://i.pravatar.cc/150?u=liam",
    },
    action: "invited you to an event -",
    subject: "SUMMER BBQ",
    time: "8 days ago",
    thumbnail: "https://picsum.photos/200/200?random=4",
    isRead: true,
  },
  {
    id: "5",
    type: "social",
    user: {
      name: "Sara Lee",
      avatar: "https://i.pravatar.cc/150?u=sara",
    },
    action: "commented on your post -",
    subject: "'Can't wait!'",
    time: "21/12/2025",
    thumbnail: "https://picsum.photos/200/200?random=5",
    isRead: true,
  },
];

export const ACTIVITY_NOTIFICATIONS: Notification[] = [
  {
    id: "sys-1",
    type: "system",
    title: "Welcome to Runwae!",
    message: "It's time to get started planning and travelling.",
    icon: Info,
    time: "20 minutes ago",
    isRead: false,
  },
  {
    id: "sys-2",
    type: "system",
    message: "You earned a new award -",
    subject: "'Rookie Traveler'",
    icon: Trophy,
    time: "Yesterday",
    isRead: true,
  },
];
