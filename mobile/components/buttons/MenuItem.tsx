import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

import { Text } from '@/components';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { textStyles } from '@/utils/styles';

export default function MenuItem({
  title,
  subtitle,
  onPress,
  icon,
}: {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  icon?: React.ReactNode;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    menuItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      gap: 12,
    },
    menuItemText: {
      flex: 1,
    },
    menuTitle: {
      ...textStyles.bold_20,
      fontSize: 16,
      color:
        title === 'Log out'
          ? colors.destructiveColors.default
          : colors.textColors.default,
    },
    menuSubtitle: {
      ...textStyles.regular_14,
      fontSize: 12,
      color:
        title === 'Log out'
          ? colors.destructiveColors.default
          : colors.textColors.subtitle,
    },
    menuItemIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor:
        title === 'Log out'
          ? colors.destructiveColors.background
          : colors.backgroundColors.subtle,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.menuItem}
      activeOpacity={0.7}>
      {icon ? <View style={styles.menuItemIcon}>{icon}</View> : null}
      <View style={styles.menuItemText}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
      </View>
      {title !== 'Log out' ? (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textColors.subtitle}
        />
      ) : null}
    </TouchableOpacity>
  );
}
