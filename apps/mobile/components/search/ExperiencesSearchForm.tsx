import {
  useExperiencesSearchState,
  type ExperienceCategory,
} from '@/hooks/useExperiencesSearchState';
import DateModal from '@/components/trips/edit/DateModal';
import { useTheme } from '@react-navigation/native';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  Calendar,
  Compass,
  Search,
  Sparkles,
  Ticket,
  Utensils,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const PINK = '#FF1F8C';

const CATEGORY_OPTIONS: {
  key: ExperienceCategory;
  label: string;
  icon: (color: string) => React.ReactNode;
}[] = [
  { key: 'all', label: 'All', icon: (c) => <Sparkles size={14} color={c} /> },
  { key: 'tour', label: 'Tours', icon: (c) => <Compass size={14} color={c} /> },
  { key: 'event', label: 'Events', icon: (c) => <Ticket size={14} color={c} /> },
  { key: 'eat', label: 'Eats', icon: (c) => <Utensils size={14} color={c} /> },
  {
    key: 'adventure',
    label: 'Adventures',
    icon: (c) => <Sparkles size={14} color={c} />,
  },
];

export default function ExperiencesSearchForm() {
  const { dark } = useTheme();
  const router = useRouter();
  const [datesOpen, setDatesOpen] = useState(false);
  const {
    state,
    setTerm,
    setWhen,
    setCategory,
    isValid,
    toQueryParams,
  } = useExperiencesSearchState();

  const onSearch = () => {
    const params = toQueryParams();
    if (!params) return;
    router.push({ pathname: '/experiences-search/results', params });
  };

  const cardBg = dark ? '#1c1c1e' : '#ffffff';
  const borderClr = dark ? '#27272a' : '#EEF0F3';
  const labelClr = dark ? '#9ca3af' : '#6B7280';

  const whenLabel = state.when
    ? format(new Date(state.when), 'MMM d')
    : 'Anytime';

  return (
    <Animated.View
      style={styles.wrap}
      entering={FadeIn.duration(280)}
      layout={LinearTransition.springify().damping(18).stiffness(180)}>
      <View style={styles.headerRow}>
        <Text style={[styles.heading, { color: dark ? '#fff' : '#0F1115' }]}>
          What are you up for?
        </Text>
        <Text style={[styles.subheading, { color: labelClr }]}>
          Tours, events, restaurants — pick your vibe.
        </Text>
      </View>

      {/* Term */}
      <View
        style={[
          styles.inputCard,
          { backgroundColor: cardBg, borderColor: borderClr },
        ]}>
        <Search size={18} color={dark ? '#fff' : '#0F1115'} />
        <TextInput
          value={state.term ?? ''}
          onChangeText={setTerm}
          placeholder="Try 'Lisbon tours' or 'Tokyo ramen'"
          placeholderTextColor="#9ca3af"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={onSearch}
          style={[
            styles.input,
            { color: dark ? '#fff' : '#0F1115' },
          ]}
        />
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}>
        {CATEGORY_OPTIONS.map((opt) => {
          const active = state.category === opt.key;
          const tint = active ? '#fff' : dark ? '#fff' : '#0F1115';
          return (
            <Pressable
              key={opt.key}
              onPress={() => setCategory(opt.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? PINK : cardBg,
                  borderColor: active ? PINK : borderClr,
                },
              ]}>
              {opt.icon(tint)}
              <Text
                style={[
                  styles.chipText,
                  { color: tint, fontWeight: active ? '700' : '500' },
                ]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Dates */}
      <Pressable
        onPress={() => setDatesOpen(true)}
        style={[
          styles.dateRow,
          { backgroundColor: cardBg, borderColor: borderClr },
        ]}>
        <Calendar size={16} color={dark ? '#fff' : '#0F1115'} />
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>When</Text>
          <Text
            style={[
              styles.dateValue,
              { color: dark ? '#fff' : '#0F1115' },
            ]}>
            {whenLabel}
          </Text>
        </View>
        {state.when ? (
          <Pressable hitSlop={8} onPress={() => setWhen(null)}>
            <Text style={styles.clear}>Clear</Text>
          </Pressable>
        ) : null}
      </Pressable>

      <View style={{ height: 6 }} />

      <SearchButton enabled={isValid} onPress={onSearch} />

      <DateModal
        visible={datesOpen}
        onClose={() => setDatesOpen(false)}
        onSelect={(startId) => setWhen(startId)}
        initialStartDate={state.when ?? undefined}
      />
    </Animated.View>
  );
}

function SearchButton({
  enabled,
  onPress,
}: {
  enabled: boolean;
  onPress: () => void;
}) {
  const opacity = useSharedValue(enabled ? 1 : 0.45);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    opacity.value = withTiming(enabled ? 1 : 0.45, { duration: 220 });
  }, [enabled, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.searchBtnWrap, animatedStyle]}>
      <Pressable
        onPress={onPress}
        disabled={!enabled}
        onPressIn={() => {
          if (!enabled) return;
          scale.value = withSpring(0.97, { damping: 18, stiffness: 320 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 18, stiffness: 320 });
        }}
        style={styles.searchBtn}>
        <Text style={styles.searchBtnText}>Search experiences</Text>
        {enabled ? (
          <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut}>
            <ArrowRight size={18} color="#fff" />
          </Animated.View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 4,
    paddingTop: 8,
    gap: 18,
  },
  headerRow: {
    paddingHorizontal: 4,
    gap: 4,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    fontFamily: Platform.select({
      ios: 'BricolageGrotesque-ExtraBold',
      android: 'BricolageGrotesque-ExtraBold',
    }),
  },
  subheading: { fontSize: 13.5, fontWeight: '500' },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  chipsRow: {
    paddingHorizontal: 4,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: { fontSize: 13 },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  label: {
    fontSize: 11.5,
    color: '#9ca3af',
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dateValue: { fontSize: 16, fontWeight: '700' },
  clear: { color: PINK, fontWeight: '700', fontSize: 13 },
  searchBtnWrap: { marginTop: 4 },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: PINK,
    paddingVertical: 17,
    borderRadius: 999,
    shadowColor: PINK,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 4,
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
