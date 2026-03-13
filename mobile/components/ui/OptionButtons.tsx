import { ChevronRight } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

const OptionButtons = ({
  title,
  icon,
  badge,
  badgeText,
  onPress,
}: {
  title: string;
  icon: any;
  badge?: boolean;
  badgeText?: string;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between border-b border-b-gray-100 py-4 dark:border-b-gray-800"
    >
      <View className="flex-row items-center gap-x-2">
        <View className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900/60">
          {icon}
        </View>
        <Text className="text-base font-semibold text-black dark:text-white">
          {title}
        </Text>
      </View>

      {badge ? (
        <View className="flex items-center justify-center rounded-full bg-primary/10 px-[15px] py-[8px] dark:bg-primary/10">
          <Text className="text-xs font-semibold text-primary dark:text-primary">
            {badgeText}
          </Text>
        </View>
      ) : (
        <ChevronRight size={15} color="#ADB5BD" />
      )}
    </TouchableOpacity>
  );
};

export default OptionButtons;
