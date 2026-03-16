import { useTheme } from "@react-navigation/native";
import { Search, Settings2 } from "lucide-react-native";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onFilterPress?: () => void;
}

const SearchInput = ({
  placeholder = "Search...",
  value,
  onChangeText,
  onFilterPress,
}: SearchInputProps) => {
  const { dark } = useTheme();

  return (
    <View className="flex-row items-center border h-[48px] px-2 border-gray-200 dark:border-dark-seconndary bg-[#F8F9FA] dark:bg-dark-seconndary/50 rounded-[6px]">
      <Search
        size={17}
        color={dark ? "#9ca3af" : "#9ca3af"}
        strokeWidth={1.5}
      />
      <TextInput
        className="flex-1 ml-3 text-sm text-black dark:text-white"
        placeholder={placeholder}
        placeholderTextColor={dark ? "#9ca3af" : "#9ca3af"}
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity onPress={onFilterPress} className="ml-2">
        <Settings2
          size={17}
          color={dark ? "#9ca3af" : "#9ca3af"}
          strokeWidth={1.5}
        />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;
