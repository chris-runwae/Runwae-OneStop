import { AppFonts, Colors } from '@/constants';
import { useTheme } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ActionOption {
  label: string;
  onPress: () => void;
  isDestructive?: boolean;
  isBold?: boolean;
  hasSeparator?: boolean;
}

interface ActionMenuProps {
  visible: boolean;
  onClose: () => void;
  options: ActionOption[];
  title?: string;
  anchorPosition?: { top: number; right?: number; left?: number };
}

const ActionMenu = ({
  visible,
  onClose,
  options,
  anchorPosition,
}: ActionMenuProps) => {
  const insets = useSafeAreaInsets();
  const { dark } = useTheme();
  const colors = Colors[dark ? 'dark' : 'light'];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View
            style={[
              styles.menuContainer,
              {
                backgroundColor: dark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.5)',
                borderColor: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
              },
              anchorPosition
                ? { 
                    top: anchorPosition.top, 
                    ...(anchorPosition.left !== undefined ? { left: anchorPosition.left } : {}),
                    ...(anchorPosition.right !== undefined ? { right: anchorPosition.right } : {}),
                  }
                : { top: insets.top + 100, right: 24 },
            ]}>
            <BlurView intensity={30} tint={dark ? 'dark' : 'light'} style={styles.blurContainer}>
              {options.map((option, index) => (
                <View key={index}>
                  {option.hasSeparator && (
                    <View style={[styles.separator, { backgroundColor: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }]} />
                  )}
                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                      option.onPress();
                    }}
                    style={styles.option}>
                    <Text
                      style={[
                        styles.optionText,
                        { color: colors.textColors.default },
                        option.isDestructive && styles.destructiveText,
                        option.isBold && styles.boldText,
                      ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </BlurView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ActionMenu;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    width: 170,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 100,
    elevation: 12,
  },
  blurContainer: {
    paddingVertical: 8,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 13,
    fontFamily: AppFonts.inter.regular,
  },
  destructiveText: {
    color: '#FF2D1B',
  },
  boldText: {
    fontFamily: AppFonts.inter.semiBold,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
    marginVertical: 4,
  },
});
