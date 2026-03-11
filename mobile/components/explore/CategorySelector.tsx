import React from 'react';
import { ScrollView, Pressable } from 'react-native';
import { Text } from '@/components';
import { textStyles } from '@/utils/styles';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants';

type Category = 'all' | 'romantic-getaway' | 'sports' | 'relax';

interface CategoryItem {
  id: Category;
  label: string;
  emoji: string;
}

interface CategorySelectorProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
}

const categories: CategoryItem[] = [
  { id: 'all', label: 'All', emoji: '' },
  { id: 'romantic-getaway', label: 'Romantic Getaway', emoji: '❤️' },
  { id: 'sports', label: 'Sports', emoji: '🏆' },
  { id: 'relax', label: 'Relax', emoji: '🧘' },
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="mb-6 px-[12px]">
      {categories.map((category) => (
        <Pressable
          key={category.id}
          className={`mr-2 rounded-full border px-4 py-2 ${
            selectedCategory === category.id
              ? 'border-pink-600 bg-pink-600'
              : 'border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-[#F8F9FA]/10'
          }`}
          onPress={() => onSelectCategory(category.id)}>
          <Text
            className={[
              textStyles.subtitle_Regular,
              'text-sm',
              selectedCategory === category.id
                ? 'text-gray-900'
                : 'text-gray-900 dark:text-white',
            ].join(' ')}>
            {category.emoji} {category.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
};
