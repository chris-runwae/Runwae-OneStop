import { AppFonts } from '@/constants';
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

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View
            style={[
              styles.menuContainer,
              anchorPosition
                ? { 
                    top: anchorPosition.top, 
                    ...(anchorPosition.left !== undefined ? { left: anchorPosition.left } : {}),
                    ...(anchorPosition.right !== undefined ? { right: anchorPosition.right } : {}),
                  }
                : { top: insets.top + 100, right: 24 },
            ]}>
            <BlurView intensity={30} tint="light" style={styles.blurContainer}>
              {options.map((option, index) => (
                <View key={index}>
                  {option.hasSeparator && <View style={styles.separator} />}
                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                      option.onPress();
                    }}
                    style={styles.option}>
                    <Text
                      style={[
                        styles.optionText,
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
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
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
    color: '#000',
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
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginHorizontal: 16,
    marginVertical: 4,
  },
});
