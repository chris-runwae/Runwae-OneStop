import { Colors, textStyles } from '@/constants';
import { useTheme } from "expo-router/react-navigation";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Clock, MapPin, Search, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  initialValue?: string | null;
  onClose: () => void;
  onSelect: (term: string) => void;
};

const RECENTS_KEY = 'hotel.search.recents.v1';
const MAX_RECENTS = 6;

export default function DestinationInput({
  visible,
  initialValue,
  onClose,
  onSelect,
}: Props) {
  const { dark } = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState(initialValue ?? '');
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) return;
    setQuery(initialValue ?? '');
    AsyncStorage.getItem(RECENTS_KEY)
      .then((raw) => {
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setRecents(parsed.slice(0, MAX_RECENTS));
        } catch {
          // ignore — will reset on next save
        }
      })
      .catch(() => {});
  }, [visible, initialValue]);

  const persistRecent = useCallback(async (term: string) => {
    try {
      const raw = await AsyncStorage.getItem(RECENTS_KEY);
      const prev = raw ? (JSON.parse(raw) as string[]) : [];
      const next = [term, ...prev.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(
        0,
        MAX_RECENTS,
      );
      await AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(next));
    } catch {
      // best-effort
    }
  }, []);

  const submit = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      void persistRecent(trimmed);
      onSelect(trimmed);
      onClose();
    },
    [onClose, onSelect, persistRecent],
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            backgroundColor: colors.backgroundColors.default,
          },
        ]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={24} color={dark ? '#fff' : '#000'} />
          </Pressable>
          <Text style={[styles.title, { color: dark ? '#fff' : '#000' }]}>
            Where to?
          </Text>
          <Pressable
            testID="destination-done"
            onPress={() => submit(query)}
            disabled={!query.trim()}
            hitSlop={10}>
            <Text
              style={[
                styles.done,
                { opacity: query.trim() ? 1 : 0.4 },
              ]}>
              Done
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.searchRow,
            { backgroundColor: colors.backgroundColors.subtle },
          ]}>
          <Search size={18} color={colors.icon} />
          <TextInput
            testID="destination-input"
            value={query}
            onChangeText={setQuery}
            placeholder="City, hotel, or address"
            placeholderTextColor="#9ca3af"
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => submit(query)}
            style={[styles.searchInput, { color: dark ? '#fff' : '#000' }]}
          />
        </View>

        {recents.length > 0 ? (
          <View style={styles.recentsBlock}>
            <Text
              style={[styles.recentsHeader, { color: colors.textColors.subtle }]}>
              Recent searches
            </Text>
            <FlatList
              data={recents}
              keyExtractor={(item) => item}
              ItemSeparatorComponent={() => (
                <View
                  style={[
                    styles.separator,
                    { backgroundColor: colors.borderColors.subtle },
                  ]}
                />
              )}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.row}
                  onPress={() => submit(item)}>
                  <Clock size={16} color={colors.icon} />
                  <Text style={[styles.rowText, { color: dark ? '#fff' : '#000' }]}>
                    {item}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        ) : (
          <View style={styles.hint}>
            <MapPin size={18} color="#FF1F8C" />
            <Text style={[styles.hintText, { color: colors.textColors.subtle }]}>
              Type a city or hotel name. We&apos;ll search across thousands of stays.
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: {
    ...textStyles.textHeading16,
  },
  done: {
    ...textStyles.textBody14,
    color: '#FF1F8C',
    fontWeight: '700',
  },
  searchRow: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    ...textStyles.textBody14,
  },
  recentsBlock: {
    paddingHorizontal: 20,
  },
  recentsHeader: {
    ...textStyles.textBody12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  rowText: {
    ...textStyles.textBody14,
    flex: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 30,
  },
  hint: {
    marginHorizontal: 20,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  hintText: {
    ...textStyles.textBody14,
    flex: 1,
    lineHeight: 20,
  },
});
