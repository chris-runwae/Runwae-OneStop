import type { Airport } from '@/hooks/useFlightSearchState';
import { api } from '@runwae/convex/convex/_generated/api';
import { useTheme } from '@react-navigation/native';
import { useQuery } from 'convex/react';
import { Plane, Search, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
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
import { Colors, textStyles } from '@/constants';
import { FlashList } from '@shopify/flash-list';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSelect: (airport: Airport) => void;
  excludeIata?: string;
};

const IATA_RE = /^[A-Z]{3}$/;

export default function LocationPicker({
  visible,
  title,
  onClose,
  onSelect,
  excludeIata,
}: Props) {
  const { dark } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme ?? 'light'];

  const popular = useQuery(api.flights.popularAirports, {});

  const list = useMemo(() => {
    const base = popular ?? [];
    const filtered = base.filter((a) => a.iata !== excludeIata);
    const q = query.trim().toUpperCase();
    if (!q) return filtered;
    return filtered.filter(
      (a) => a.iata.includes(q) || a.city.toUpperCase().includes(q)
    );
  }, [popular, query, excludeIata]);

  // Allow free-text IATA entry — useful for airports outside the curated list.
  const manualMatch = useMemo<Airport | null>(() => {
    const q = query.trim().toUpperCase();
    if (!IATA_RE.test(q)) return null;
    if (q === excludeIata) return null;
    if (list.some((a) => a.iata === q)) return null;
    return { iata: q, city: q };
  }, [query, list, excludeIata]);

  const reset = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            backgroundColor: dark ? '#0d0d0d' : '#ffffff',
          },
        ]}>
        <View style={styles.header}>
          <Pressable onPress={reset} hitSlop={10}>
            <X size={24} color={dark ? '#fff' : '#000'} />
          </Pressable>
          <Text style={[styles.title, { color: dark ? '#fff' : '#000' }]}>
            {title}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View
          style={[
            styles.searchRow,
            {
              backgroundColor: colors.backgroundColors.subtle,
            },
          ]}>
          <Search size={18} color={colors.icon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="City or 3-letter code (e.g. LHR)"
            placeholderTextColor="#9ca3af"
            autoCapitalize="characters"
            autoCorrect={false}
            style={[styles.searchInput, { color: dark ? '#fff' : '#000' }]}
          />
        </View>

        <FlashList
          data={manualMatch ? [manualMatch, ...list] : list}
          keyExtractor={(item) => item.iata}
          contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20 }}
          ItemSeparatorComponent={() => (
            <View
              style={[
                styles.separator,
                { backgroundColor: colors.borderColors.subtle },
              ]}
            />
          )}
          ListEmptyComponent={
            <Text
              style={{
                color: '#9ca3af',
                textAlign: 'center',
                marginTop: 24,
                paddingHorizontal: 20,
              }}>
              No airports match your search.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onSelect(item);
                reset();
              }}
              style={styles.row}>
              <Plane size={18} color={colors.icon} strokeWidth={1.8} />
              <Text style={[styles.iata, { color: colors.icon }]}>
                {item.iata}
              </Text>
              <Text
                style={[styles.city, { color: colors.textColors.subtitle }]}
                numberOfLines={1}>
                {item.city}
              </Text>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: {
    ...textStyles.textHeading20,
    fontSize: 18,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 52,
  },
  iata: {
    ...textStyles.textBody14,
    letterSpacing: 0.4,
    flex: 1,
  },
  city: {
    ...textStyles.textBody14,
    textAlign: 'right',
  },
});
