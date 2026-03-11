import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants';
import { Text } from '@/components';
import { textStyles } from '@/utils/styles';
import { LucideIcon } from 'lucide-react-native';

type FilterCategory =
  | 'all'
  | 'Food'
  | 'Nightlife'
  | 'Arts'
  | 'Culture'
  | 'Relaxation'
  | 'Music Fest'
  | 'Cultural';

export type FilterOption = {
  id: string;
  label: string;
  icon: LucideIcon;
  category: FilterCategory;
};

type FilterModalProps = {
  visible: boolean;
  onClose: () => void;
  options: FilterOption[];
  selectedFilter: FilterCategory | null;
  onSelectFilter: (filter: FilterCategory | null) => void;
};

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  options,
  selectedFilter,
  onSelectFilter,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modal: {
      backgroundColor: colors.backgroundColors.default,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: insets.bottom,
      maxHeight: '80%',
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColors.subtle,
    },
    headerTitle: {
      ...textStyles.bold_20,
      fontSize: 18,
      color: colors.textColors.default,
    },
    optionsContainer: {
      paddingVertical: 8,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 12,
    },
    optionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.backgroundColors.subtle,
      justifyContent: 'center',
      alignItems: 'center',
    },
    optionIconSelected: {
      backgroundColor: colors.primaryColors.default,
    },
    optionText: {
      ...textStyles.regular_14,
      fontSize: 16,
      flex: 1,
      color: colors.textColors.default,
    },
    optionTextSelected: {
      color: colors.primaryColors.default,
      fontWeight: '600',
    },
    clearButton: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.borderColors.subtle,
    },
    clearText: {
      ...textStyles.bold_20,
      fontSize: 16,
      textAlign: 'center',
      color: colors.primaryColors.default,
    },
    cancelButton: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.borderColors.subtle,
    },
    cancelText: {
      ...textStyles.bold_20,
      fontSize: 16,
      textAlign: 'center',
      color: colors.textColors.default,
    },
  });

  const handleOptionPress = (option: FilterOption) => {
    const newFilter =
      selectedFilter === option.category ? null : option.category;
    onSelectFilter(newFilter);
    onClose();
  };

  const handleClearFilter = () => {
    onSelectFilter(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter by Category</Text>
          </View>

          <View style={styles.optionsContainer}>
            {options.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedFilter === option.category;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={styles.option}
                  onPress={() => handleOptionPress(option)}
                  activeOpacity={0.7}>
                  <View
                    style={[
                      styles.optionIcon,
                      isSelected && styles.optionIconSelected,
                    ]}>
                    <Icon
                      size={20}
                      color={isSelected ? '#FFFFFF' : colors.textColors.default}
                    />
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedFilter && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearFilter}
              activeOpacity={0.7}>
              <Text style={styles.clearText}>Clear Filter</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
