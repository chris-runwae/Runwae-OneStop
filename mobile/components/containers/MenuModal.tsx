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

export type MenuOption = {
  id: string;
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  destructive?: boolean;
};

type MenuModalProps = {
  visible: boolean;
  onClose: () => void;
  options: MenuOption[];
};

export const MenuModal: React.FC<MenuModalProps> = ({
  visible,
  onClose,
  options,
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
    optionText: {
      ...textStyles.regular_14,
      fontSize: 16,
      flex: 1,
    },
    cancelButton: {
      marginTop: 8,
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

  const handleOptionPress = (option: MenuOption) => {
    option.onPress();
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
            <Text style={styles.headerTitle}>Options</Text>
          </View>

          <View style={styles.optionsContainer}>
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={styles.option}
                  onPress={() => handleOptionPress(option)}
                  activeOpacity={0.7}>
                  <View
                    style={[
                      styles.optionIcon,
                      option.destructive && {
                        backgroundColor: colors.destructiveColors.background,
                      },
                    ]}>
                    <Icon
                      size={20}
                      color={
                        option.destructive
                          ? colors.destructiveColors.default
                          : colors.textColors.default
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      option.destructive && {
                        color: colors.destructiveColors.default,
                      },
                    ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

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
