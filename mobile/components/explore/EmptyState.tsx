import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Text } from '@/components';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';
import { Search, Filter } from 'lucide-react-native';

type EmptyStateProps = {
  type: 'search' | 'filter';
  query?: string;
  filter?: string;
};

export const EmptyState: React.FC<EmptyStateProps> = ({ type, query, filter }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: 40,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.backgroundColors.subtle,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      ...textStyles.bold_20,
      fontSize: 18,
      color: colors.textColors.default,
      textAlign: 'center',
      marginBottom: 8,
    },
    description: {
      ...textStyles.regular_14,
      fontSize: 14,
      color: colors.textColors.subtle,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  const Icon = type === 'search' ? Search : Filter;

  const getTitle = () => {
    if (type === 'search') {
      return 'No results found';
    }
    return 'No items match this filter';
  };

  const getDescription = () => {
    if (type === 'search') {
      return query 
        ? `No results found for "${query}". Try searching with different keywords.`
        : 'Try searching for destinations, experiences, or events.';
    }
    return filter
      ? `No items found for "${filter}". Try selecting a different filter.`
      : 'Try selecting a filter to see specific categories.';
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon size={32} color={colors.textColors.subtle} />
      </View>
      <Text style={styles.title}>{getTitle()}</Text>
      <Text style={styles.description}>{getDescription()}</Text>
    </View>
  );
};
