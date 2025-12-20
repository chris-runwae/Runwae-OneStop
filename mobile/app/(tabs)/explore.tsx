import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CalendarDays, MapPin, Users, Search } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { TextInput, PrimaryButton } from '@/components';
import { Colors } from '@/constants';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { textStyles } from '@/utils/styles';
import { searchPlaces } from '@/services/liteapi';
import type { LiteAPIPlace } from '@/types/liteapi.types';

type SearchType = 'destination' | 'vibe';

export default function ExploreScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [searchType, setSearchType] = useState<SearchType>('destination');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [vibeQuery, setVibeQuery] = useState('');
  const [places, setPlaces] = useState<LiteAPIPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<LiteAPIPlace | null>(null);
  const [showPlaceResults, setShowPlaceResults] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  const [checkin, setCheckin] = useState<Date>(new Date());
  const [checkout, setCheckout] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  });
  const [showCheckinPicker, setShowCheckinPicker] = useState(false);
  const [showCheckoutPicker, setShowCheckoutPicker] = useState(false);
  const [guests, setGuests] = useState(2);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColors.default,
      padding: 16,
    },
    title: {
      ...textStyles.bold_20,
      fontSize: 24,
      marginBottom: 24,
      color: colors.textColors.default,
    },
    searchTypeContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    searchTypeButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 2,
      alignItems: 'center',
    },
    searchTypeButtonActive: {
      backgroundColor: colors.primaryColors.background,
      borderColor: colors.primaryColors.default,
    },
    searchTypeButtonInactive: {
      backgroundColor: 'transparent',
      borderColor: colors.borderColors.subtle,
    },
    searchTypeText: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      fontWeight: '500',
    },
    inputContainer: {
      marginBottom: 16,
      position: 'relative',
    },
    placeResultsContainer: {
      position: 'absolute',
      top: 60,
      left: 0,
      right: 0,
      backgroundColor: colors.backgroundColors.default,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColors.subtle,
      maxHeight: 200,
      zIndex: 1000,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    placeResultItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColors.subtle,
    },
    dateRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    dateButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.borderColors.subtle,
      gap: 8,
    },
    dateText: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      color: colors.textColors.default,
    },
    guestsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.borderColors.subtle,
      marginBottom: 24,
      gap: 8,
    },
    guestsControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginLeft: 'auto',
    },
    guestButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primaryColors.default,
      alignItems: 'center',
      justifyContent: 'center',
    },
    guestButtonText: {
      ...textStyles.bold_20,
      fontSize: 18,
      color: colors.white,
    },
    guestCount: {
      ...textStyles.subtitle_Regular,
      fontSize: 16,
      minWidth: 30,
      textAlign: 'center',
      color: colors.textColors.default,
    },
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSearchPlaces = async (query: string) => {
    if (query.length < 2) {
      setShowPlaceResults(false);
      setPlaces([]);
      return;
    }

    setLoadingPlaces(true);
    try {
      const response = await searchPlaces(query);
      // Filter out any undefined/null places and ensure they have required properties
      const validPlaces = (response.data || []).filter(
        (place): place is LiteAPIPlace =>
          place != null &&
          typeof place === 'object' &&
          typeof place.placeId === 'string' &&
          typeof place.displayName === 'string'
      );
      setPlaces(validPlaces);
      setShowPlaceResults(validPlaces.length > 0);
    } catch (error) {
      console.error('Error searching places:', error);
      setPlaces([]);
      setShowPlaceResults(false);
    } finally {
      setLoadingPlaces(false);
    }
  };

  const handleSelectPlace = (place: LiteAPIPlace) => {
    if (!place || !place.displayName) {
      console.error('Invalid place selected:', place);
      return;
    }
    setSelectedPlace(place);
    setDestinationQuery(place.displayName);
    setShowPlaceResults(false);
  };

  const handleSearch = () => {
    if (
      searchType === 'destination' &&
      (!selectedPlace || !selectedPlace.placeId)
    ) {
      return;
    }
    if (searchType === 'vibe' && !vibeQuery.trim()) {
      return;
    }

    const searchParams: Record<string, string> = {
      searchType,
      vibeQuery: vibeQuery.trim(),
      checkin: checkin.toISOString().split('T')[0],
      checkout: checkout.toISOString().split('T')[0],
      guests: guests.toString(),
    };

    if (searchType === 'destination' && selectedPlace?.placeId) {
      searchParams.placeId = selectedPlace.placeId;
    }

    router.push({
      pathname: '/hotel-search-results',
      params: searchParams,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}>
      <ThemedText style={styles.title}>Find Your Perfect Stay</ThemedText>

      <View style={styles.searchTypeContainer}>
        <Pressable
          style={[
            styles.searchTypeButton,
            searchType === 'destination'
              ? styles.searchTypeButtonActive
              : styles.searchTypeButtonInactive,
          ]}
          onPress={() => setSearchType('destination')}>
          <ThemedText
            style={[
              styles.searchTypeText,
              {
                color:
                  searchType === 'destination'
                    ? colors.primaryColors.default
                    : colors.textColors.subtle,
              },
            ]}>
            Destination
          </ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.searchTypeButton,
            searchType === 'vibe'
              ? styles.searchTypeButtonActive
              : styles.searchTypeButtonInactive,
          ]}
          onPress={() => setSearchType('vibe')}>
          <ThemedText
            style={[
              styles.searchTypeText,
              {
                color:
                  searchType === 'vibe'
                    ? colors.primaryColors.default
                    : colors.textColors.subtle,
              },
            ]}>
            Search by Vibe
          </ThemedText>
        </Pressable>
      </View>

      {searchType === 'destination' ? (
        <View style={styles.inputContainer}>
          <TextInput
            label="Where are you going?"
            placeholder="Search for a destination"
            value={destinationQuery}
            onChangeText={(text) => {
              setDestinationQuery(text);
              handleSearchPlaces(text);
            }}
            onFocus={() => {
              if (places.length > 0) setShowPlaceResults(true);
            }}
          />
          {showPlaceResults && places.length > 0 && (
            <View style={styles.placeResultsContainer}>
              {loadingPlaces && (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <ActivityIndicator
                    size="small"
                    color={colors.primaryColors.default}
                  />
                </View>
              )}
              {!loadingPlaces &&
                places
                  .filter(
                    (place) => place && place.placeId && place.displayName
                  )
                  .map((place) => (
                    <Pressable
                      key={place.placeId}
                      style={styles.placeResultItem}
                      onPress={() => handleSelectPlace(place)}>
                      <ThemedText style={{ color: colors.textColors.default }}>
                        {place.displayName}
                      </ThemedText>
                      <ThemedText
                        style={{
                          fontSize: 12,
                          color: colors.textColors.subtle,
                          marginTop: 4,
                        }}>
                        {place.formattedAddress || ''}
                      </ThemedText>
                    </Pressable>
                  ))}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <TextInput
            label="Describe your ideal stay"
            placeholder="e.g., romantic getaway in Paris"
            value={vibeQuery}
            onChangeText={setVibeQuery}
          />
        </View>
      )}

      <View style={styles.dateRow}>
        <Pressable
          style={styles.dateButton}
          onPress={() => setShowCheckinPicker(true)}>
          <CalendarDays size={18} color={colors.textColors.default} />
          <View>
            <ThemedText
              style={[
                styles.dateText,
                { fontSize: 12, color: colors.textColors.subtle },
              ]}>
              Check-in
            </ThemedText>
            <ThemedText style={styles.dateText}>
              {formatDate(checkin)}
            </ThemedText>
          </View>
        </Pressable>

        <Pressable
          style={styles.dateButton}
          onPress={() => setShowCheckoutPicker(true)}>
          <CalendarDays size={18} color={colors.textColors.default} />
          <View>
            <ThemedText
              style={[
                styles.dateText,
                { fontSize: 12, color: colors.textColors.subtle },
              ]}>
              Check-out
            </ThemedText>
            <ThemedText style={styles.dateText}>
              {formatDate(checkout)}
            </ThemedText>
          </View>
        </Pressable>
      </View>

      {showCheckinPicker && (
        <DateTimePicker
          value={checkin}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowCheckinPicker(false);
            if (selectedDate) {
              setCheckin(selectedDate);
              // Ensure checkout is after checkin
              if (selectedDate >= checkout) {
                const newCheckout = new Date(selectedDate);
                newCheckout.setDate(newCheckout.getDate() + 1);
                setCheckout(newCheckout);
              }
            }
          }}
        />
      )}

      {showCheckoutPicker && (
        <DateTimePicker
          value={checkout}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date(checkin.getTime() + 24 * 60 * 60 * 1000)}
          onChange={(event, selectedDate) => {
            setShowCheckoutPicker(false);
            if (selectedDate) {
              setCheckout(selectedDate);
            }
          }}
        />
      )}

      <View style={styles.guestsContainer}>
        <Users size={18} color={colors.textColors.default} />
        <ThemedText style={styles.dateText}>Guests</ThemedText>
        <View style={styles.guestsControls}>
          <Pressable
            style={styles.guestButton}
            onPress={() => setGuests(Math.max(1, guests - 1))}>
            <ThemedText style={styles.guestButtonText}>-</ThemedText>
          </Pressable>
          <ThemedText style={styles.guestCount}>{guests}</ThemedText>
          <Pressable
            style={styles.guestButton}
            onPress={() => setGuests(guests + 1)}>
            <ThemedText style={styles.guestButtonText}>+</ThemedText>
          </Pressable>
        </View>
      </View>

      <PrimaryButton
        title="Search Hotels"
        onPress={handleSearch}
        disabled={
          (searchType === 'destination' && !selectedPlace) ||
          (searchType === 'vibe' && !vibeQuery.trim())
        }
      />
    </ScrollView>
  );
}
