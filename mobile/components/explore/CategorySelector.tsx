import React from 'react';
import { ScrollView, Pressable, StyleSheet } from 'react-native';
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

  const styles = StyleSheet.create({
    container: {
      marginBottom: 24,
    },
    button: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginRight: 8,
      borderWidth: 1,
    },
    buttonActive: {
      backgroundColor: colors.primaryColors.default,
      borderColor: colors.primaryColors.default,
    },
    buttonInactive: {
      backgroundColor: 'transparent',
      borderColor: colors.borderColors.subtle,
    },
    text: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
    },
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => (
        <Pressable
          key={category.id}
          style={[
            styles.button,
            selectedCategory === category.id
              ? styles.buttonActive
              : styles.buttonInactive,
          ]}
          onPress={() => onSelectCategory(category.id)}
        >
          <Text
            style={[
              styles.text,
              {
                color:
                  selectedCategory === category.id
                    ? colors.white
                    : colors.textColors.default,
              },
            ]}
          >
            {category.emoji} {category.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
};
