import { AppFonts, Colors } from '@/constants';
import { useTheme } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';

export interface ActionOption {
  label: string;
  onPress: () => void;
  isDestructive?: boolean;
  isBold?: boolean;
  hasSeparator?: boolean;
  isSelected?: boolean;
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
                backgroundColor: dark ? 'rgba(40, 40, 40, 0.95)' : 'rgba(255, 255, 255, 0.85)',
                borderColor: dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.7)',
              },
              anchorPosition
                ? { 
                    top: anchorPosition.top, 
                    ...(anchorPosition.left !== undefined ? { left: anchorPosition.left } : {}),
                    ...(anchorPosition.right !== undefined ? { right: anchorPosition.right } : {}),
                  }
                : { top: insets.top + 100, right: 24 },
            ]}>
            <BlurView intensity={90} tint={dark ? 'dark' : 'light'} style={styles.blurContainer}>
              <ScrollView 
                style={{ maxHeight: 240 }} 
                showsVerticalScrollIndicator={false}
                bounces={options.length > 5}
              >
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
                      style={[styles.option, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                      <Text
                        style={[
                          styles.optionText,
                          { color: colors.textColors.default },
                          option.isDestructive && styles.destructiveText,
                          option.isBold && styles.boldText,
                        ]}>
                        {option.label}
                      </Text>
                      {option.isSelected && (
                        <Check size={16} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
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
