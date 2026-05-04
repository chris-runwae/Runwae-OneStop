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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  const popular = useQuery(api.flights.popularAirports, {});

  const list = useMemo(() => {
    const base = popular ?? [];
    const filtered = base.filter((a) => a.iata !== excludeIata);
    const q = query.trim().toUpperCase();
    if (!q) return filtered;
    return filtered.filter(
      (a) => a.iata.includes(q) || a.city.toUpperCase().includes(q),
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
              backgroundColor: dark ? '#1c1c1e' : '#f3f4f6',
            },
          ]}>
          <Search size={18} color="#9ca3af" />
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

        <FlatList
          data={manualMatch ? [manualMatch, ...list] : list}
          keyExtractor={(item) => item.iata}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          ListEmptyComponent={
            <Text
              style={{
                color: '#9ca3af',
                textAlign: 'center',
                marginTop: 24,
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
              style={({ pressed }) => [
                styles.row,
                {
                  borderBottomColor: dark ? '#1f1f22' : '#f3f4f6',
                  opacity: pressed ? 0.6 : 1,
                },
              ]}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: dark ? '#1c1c1e' : '#FFE5F0' },
                ]}>
                <Plane size={18} color="#FF1F8C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.iata,
                    { color: dark ? '#fff' : '#000' },
                  ]}>
                  {item.iata}
                </Text>
                <Text style={styles.city}>{item.city}</Text>
              </View>
            </Pressable>
          )}
        />
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
  title: { fontSize: 17, fontWeight: '600' },
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
  searchInput: { flex: 1, fontSize: 15 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iata: { fontSize: 16, fontWeight: '700' },
  city: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
});
