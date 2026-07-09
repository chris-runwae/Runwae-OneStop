import { Text } from '@/components';
import { AppFonts, Colors } from '@/constants';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export type GroupSize = 'solo' | 'small' | 'large';

const OPTIONS: {
  value: GroupSize;
  emoji: string;
  label: string;
  hint: string;
}[] = [
  { value: 'solo', emoji: '🙋🏽', label: 'Just me', hint: 'Solo traveller' },
  {
    value: 'small',
    emoji: '👯',
    label: 'A few of us',
    hint: '2–4 friends, partner, or family',
  },
  {
    value: 'large',
    emoji: '🌍',
    label: 'Big crew',
    hint: '5+ — bachelor, birthday, group trip',
  },
];

type Props = {
  width: number;
  value: GroupSize | null;
  onChange: (value: GroupSize) => void;
};

const GroupSizeStep = ({ width, value, onChange }: Props) => {
  const dark = useColorScheme() === 'dark';
  const colors = Colors[dark ? 'dark' : 'light'];

  return (
    <View style={[styles.container, { width }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.textColors.default }]}>
          Who&#39;s coming on this {'\n'}adventure? ✨
        </Text>
        <Text style={[styles.subtitle, { color: colors.textColors.subtle }]}>
          Helps us pick the right vibe.
        </Text>

        <View style={{ gap: 12 }}>
          {OPTIONS.map((opt) => {
            const selected = opt.value === value;
            return (
              <TouchableOpacity
                key={opt.value}
                activeOpacity={0.85}
                onPress={() => onChange(opt.value)}
                style={[
                  styles.card,
                  {
                    backgroundColor: selected
                      ? colors.primaryColors.default
                      : colors.backgroundColors.default,
                    borderWidth: 1,
                    borderColor: colors.borderColors.subtle,
                  },
                ]}>
                <View>
                  <Text style={styles.emoji}>{opt.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.label,
                      {
                        color: selected
                          ? colors.backgroundColors.default
                          : colors.textColors.default,
                      },
                    ]}>
                    {opt.label}
                  </Text>
                  <Text
                    style={[
                      styles.hint,
                      {
                        color: selected
                          ? colors.backgroundColors.default
                          : colors.textColors.default,
                      },
                    ]}>
                    {opt.hint}
                  </Text>
                </View>
                {selected ? (
                  <Animated.View
                    entering={FadeIn.duration(120)}
                    style={styles.checkDot}
                  />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default GroupSizeStep;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  title: {
    paddingVertical: 12,
    fontSize: 24,
    fontFamily: AppFonts.bricolage.extraBold,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: AppFonts.inter.regular,
    marginBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
  },
  emoji: {
    fontSize: 26,
    paddingVertical: 12,
  },
  label: {
    fontSize: 15,
    fontFamily: AppFonts.inter.medium,
    marginBottom: 2,
  },
  hint: {
    fontSize: 12,
    fontFamily: AppFonts.inter.regular,
  },
  checkDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF1F8C',
  },
});
