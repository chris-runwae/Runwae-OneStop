import React, { useRef, useEffect } from 'react';
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  useColorScheme,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants';
import { XIcon } from 'lucide-react-native';

import { Text } from '@/components';
import { textStyles } from '@/utils/styles';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MenuOption {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  destructive?: boolean;
  disabled?: boolean;
}

interface IOSMenuSheetProps {
  visible: boolean;
  onClose: () => void;
  options: MenuOption[];
  title?: string;
  cancelLabel?: string;
}

export const IOSMenuSheet: React.FC<IOSMenuSheetProps> = ({
  visible,
  onClose,
  options,
  title,
  cancelLabel = 'Cancel',
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const dynamicStyles = StyleSheet.create({
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.borderColors.subtle,
      marginLeft: 16,
    },
    optionText: {
      ...textStyles.subtitle_Regular,
      fontSize: 16,
    },
  });

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 90,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleOptionPress = (onPress: () => void) => {
    onClose();
    // Small delay to let animation complete before executing action
    setTimeout(onPress, 150);
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </Pressable>

      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}>
        <View style={styles.menuContainer}>
          {/* Main actions group */}
          <BlurView
            intensity={80}
            tint="systemChromeMaterialLight"
            style={styles.blurContainer}>
            <View style={{ backgroundColor: colors.backgroundColors.subtle }}>
              {title && (
                <View style={styles.titleContainer}>
                  <Text style={styles.titleText}>{title}</Text>
                </View>
              )}

              {options.map((option, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <View style={dynamicStyles.separator} />}
                  <Pressable
                    style={({ pressed }) => [
                      pressed && styles.optionPressed,
                      option.disabled && styles.optionDisabled,
                    ]}
                    onPress={() =>
                      !option.disabled && handleOptionPress(option.onPress)
                    }
                    disabled={option.disabled}>
                    <View style={styles.option}>
                      {option.icon && (
                        <View style={styles.iconContainer}>{option.icon}</View>
                      )}
                      <Text
                        style={[
                          dynamicStyles.optionText,
                          option.destructive && styles.destructiveText,
                          option.disabled && styles.disabledText,
                        ]}>
                        {option.label}
                      </Text>
                    </View>
                  </Pressable>
                </React.Fragment>
              ))}

              {/* <View style={dynamicStyles.separator} /> */}

              {/* <Pressable
                style={({ pressed }) => [
                  styles.option,
                  // styles.cancelOption,
                  pressed && styles.optionPressed,
                ]}
                onPress={onClose}>
                <View style={styles.iconContainer}>
                  <XIcon size={24} color={colors.textColors.default} />
                </View>
                <Text style={[styles.optionText, styles.destructiveText]}>
                  {cancelLabel}
                </Text>
              </Pressable> */}
            </View>
          </BlurView>

          {/* Cancel button - separate group */}
          {/* <BlurView
            intensity={80}
            tint="systemChromeMaterialLight"
            style={styles.blurContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.option,
                styles.cancelOption,
                pressed && styles.optionPressed,
              ]}
              onPress={onClose}>
              <Text style={[styles.optionText, styles.cancelText]}>
                {cancelLabel}
              </Text>
            </Pressable>
          </BlurView> */}
        </View>
      </Animated.View>
    </Modal>
  );
};

// Hook for managing menu state
export const useIOSMenu = () => {
  const [visible, setVisible] = React.useState(false);

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  return {
    visible,
    open,
    close,
  };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  menuContainer: {
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, // Account for home indicator
    gap: 8,
  },
  blurContainer: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  optionsGroup: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  titleContainer: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  titleText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#8E8E93',
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    // alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  optionDisabled: {
    opacity: 0.4,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  destructiveText: {
    color: '#FF3B30',
  },
  disabledText: {
    color: '#8E8E93',
  },
  cancelOption: {
    justifyContent: 'center',
  },
  cancelText: {
    fontWeight: '600',
  },
});
