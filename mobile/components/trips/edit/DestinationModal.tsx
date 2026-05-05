import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { X, Search } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlaceSearch } from '@/components/trip-creation/hooks/usePlaceSearch';
import { LiteAPIPlace } from '@/types/liteapi.types';
import SkeletonBox from '@/components/ui/SkeletonBox';
import { Colors } from '@/constants/theme';
import { useTheme } from '@react-navigation/native';

interface DestinationModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (place: LiteAPIPlace) => void;
  initialQuery?: string;
}

export default function DestinationModal({
  visible,
  onClose,
  onSelect,
  initialQuery = '',
}: DestinationModalProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [places, setPlaces] = useState<LiteAPIPlace[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const insets = useSafeAreaInsets();
  const { dark } = useTheme();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { debouncedSearch } = usePlaceSearch(
    setPlaces,
    setSearchLoading,
    setSearchError,
    setShowSuggestions
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View
        style={[
          styles.modalContainer,
          {
            backgroundColor: colors.backgroundColors.default,
            paddingTop: insets.top,
          },
        ]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <X size={24} color={dark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: dark ? '#fff' : '#000' }]}>
            Select Destination
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.modalSearchContainer}>
          <View
            style={[
              styles.searchBox,
              { backgroundColor: dark ? '#1c1c1e' : '#f3f4f6' },
            ]}>
            <Search size={20} color="#9ca3af" style={{ marginRight: 10 }} />
            <TextInput
              style={[styles.searchInput, { color: dark ? '#fff' : '#000' }]}
              placeholder="Search city"
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                debouncedSearch(text, 300);
              }}
              autoFocus
            />
            {searchLoading && (
              <ActivityIndicator size="small" color="#FF1F8C" />
            )}
          </View>
        </View>

        <FlatList
          data={places}
          keyExtractor={(item) => item.placeId}
          style={styles.resultsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.placeItem,
                { borderBottomColor: dark ? '#333' : '#f3f4f6' },
              ]}
              onPress={() => onSelect(item)}>
              <Ionicons
                name="location-outline"
                size={20}
                color="#FF1F8C"
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.placeName, { color: dark ? '#fff' : '#000' }]}>
                  {item.displayName}
                </Text>
                {item.formattedAddress && (
                  <Text style={styles.placeAddress}>{item.formattedAddress}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              {searchLoading ? (
                <View style={{ width: '100%', padding: 20 }}>
                  {[1, 2, 3].map((i) => (
                    <View
                      key={i}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 20,
                      }}>
                      <SkeletonBox width={40} height={40} borderRadius={20} />
                      <View style={{ marginLeft: 15, flex: 1 }}>
                        <SkeletonBox width="60%" height={16} borderRadius={4} />
                        <View style={{ height: 8 }} />
                        <SkeletonBox width="90%" height={12} borderRadius={4} />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={{ alignItems: 'center', marginTop: 40 }}>
                  <Ionicons
                    name="search-outline"
                    size={48}
                    color={dark ? '#333' : '#e5e7eb'}
                  />
                  <Text style={[styles.emptyText, { marginTop: 15 }]}>
                    {searchQuery.length < 3
                      ? 'Type at least 3 characters to search'
                      : 'No results found for "' + searchQuery + '"'}
                  </Text>
                </View>
              )}
            </View>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#33333333',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalSearchContainer: {
    padding: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  resultsList: {
    flex: 1,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 0.5,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '500',
  },
  placeAddress: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  emptyContainer: {
    padding: 20,
  },
  emptyText: {
    color: '#9ca3af',
    textAlign: 'center',
  },
});
