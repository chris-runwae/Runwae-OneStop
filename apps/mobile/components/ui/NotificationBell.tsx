import { api } from "@runwae/convex/convex/_generated/api";
import { useTheme } from "@react-navigation/native";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import { Bell } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";

const NotificationBell = () => {
  const { dark } = useTheme();

  const unread = useQuery(api.notifications.unreadCount, {});
  const hasNewNotification = (unread ?? 0) > 0;

  return (
    <TouchableOpacity
      onPress={() => router.push("/notifications")}
      className="relative h-[40px] w-[40px] flex items-center justify-center rounded-full bg-gray-200 dark:bg-dark-seconndary"
    >
      <Bell size={15} strokeWidth={1.5} color={dark ? "#ffffff" : "#000000"} />
      {hasNewNotification && (
        <View className="absolute top-[9px] right-[10px] h-[6px] w-[6px] rounded-full bg-red-500" />
      )}
    </TouchableOpacity>
  );
};

export default NotificationBell;
