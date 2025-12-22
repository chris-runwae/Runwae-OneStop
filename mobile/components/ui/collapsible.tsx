import { PropsWithChildren, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';

import { Text } from '@/components';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { textStyles } from '@/utils/styles';

export function Collapsible({
  children,
  title,
  defaultOpen = true,
  titleStyle,
  iconPosition = 'left',
}: PropsWithChildren & {
  title: string;
  defaultOpen?: boolean;
  titleStyle?: StyleProp<TextStyle>;
  iconPosition?: 'left' | 'right';
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  const styles = StyleSheet.create({
    heading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: iconPosition === 'left' ? 'flex-start' : 'space-between',
      gap: 6,
    },
    content: {
      marginTop: 6,
      marginLeft: iconPosition === 'left' ? 24 : 0,
    },
    title: {
      ...textStyles.bold_20,
      fontSize: 18,
      lineHeight: 25.2,
      ...(titleStyle as TextStyle),
    },
  });

  return (
    <View>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        {iconPosition === 'left' && (
          <IconSymbol
            name="chevron.right"
            size={18}
            weight="medium"
            color={colors.textColors.default}
            style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
          />
        )}
        <Text style={styles.title}>{title}</Text>
        {iconPosition === 'right' && (
          <IconSymbol
            name="chevron.up"
            size={18}
            weight="medium"
            color={colors.textColors.default}
            style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
          />
        )}
      </TouchableOpacity>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}
