import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Search, Filter, Settings2 } from 'lucide-react-native';
import CustomTextInput from '@/components/ui/custome-input';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  placeholder?: string;
  value?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onFilter,
  placeholder = 'Search...',
  value = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(value);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    onSearch?.(text);
  };

  return (
    <View className="mb-4 flex-row items-center gap-3 px-[12px]">
      <View className="relative flex-1">
        <CustomTextInput
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textColors.subtle}
          leftIcon={<Search size={20} color={colors.textColors.subtle} />}
          rightIcon={
            <Pressable onPress={onFilter}>
              <Settings2 size={20} color={colors.textColors.subtle} />
            </Pressable>
          }
        />
      </View>
    </View>
  );
};
