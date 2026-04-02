import { useTrips } from '@/context/TripsContext';
import { usePlacesAutocomplete } from '@/hooks/usePlacesAutocomplete';
import { useTheme } from '@react-navigation/native';
import { Search, X, MapPin, Plus, Loader2 } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
 
import { Text } from '@/components';
import { AppFonts, Colors } from '@/constants';
 
interface Props {
  visible: boolean;
  onClose: () => void;
}
 
export default function SearchIdeasSheet({ visible, onClose }: Props) {
  const { dark } = useTheme();
  const colors = Colors[dark ? 'dark' : 'light'];
  const { addIdea } = useTrips();
 
  const { query, setQuery, results, loading, clearResults } = usePlacesAutocomplete();
  const translateY = useRef(new Animated.Value(600)).current;
  const inputRef = useRef<TextInput>(null);
 
  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      Animated.timing(translateY, {
        toValue: 600,
        duration: 250,
        useNativeDriver: true,
      }).start();
      setQuery('');
      clearResults();
    }
  }, [visible]);
 
  const handleSaveIdea = async (place: any) => {
    await addIdea({
      title: place.displayName,
      type: 'activity', 
      location: place.formattedAddress,
      external_id: place.placeId,
    });
    onClose();
  };
 
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
 
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.avoidingView}
        pointerEvents="box-none">
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.backgroundColors.default,
              transform: [{ translateY }],
            },
          ]}>
          <View style={styles.handleBar} />
 
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.textColors.default }]}>
              Search for Ideas
            </Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textColors.subtle} />
            </Pressable>
          </View>
 
          <View style={styles.searchContainer}>
            <Search size={18} color="#AEAEAE" style={styles.searchIcon} />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              placeholder="Search places, restaurants, activities..."
              placeholderTextColor="#AEAEAE"
              style={[styles.searchInput, { color: colors.textColors.default }]}
            />
            {loading && <Loader2 size={18} color="#FF1F8C" style={styles.loader} />}
          </View>
 
          <ScrollView
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {results.map((place) => (
              <Pressable
                key={place.placeId}
                onPress={() => handleSaveIdea(place)}
                style={({ pressed }) => [
                  styles.resultItem,
                  pressed && { backgroundColor: '#F8F9FA' },
                ]}>
                <View style={styles.resultIconBox}>
                  <MapPin size={18} color="#FF1F8C" />
                </View>
                <View style={styles.resultContent}>
                  <Text style={styles.placeName}>{place.displayName}</Text>
                  <Text style={styles.placeAddress} numberOfLines={1}>
                    {place.formattedAddress}
                  </Text>
                </View>
                <View style={styles.addIconBox}>
                  <Plus size={16} color="#AEAEAE" />
                </View>
              </Pressable>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
 
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  avoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 12,
    height: '80%',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E9ECEF',
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: AppFonts.bricolage.semiBold,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: AppFonts.inter.medium,
  },
  loader: {
    marginLeft: 10,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  resultIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  resultContent: {
    flex: 1,
  },
  placeName: {
    fontSize: 15,
    fontFamily: AppFonts.inter.semiBold,
    color: '#1A1A1A',
    marginBottom: 2,
  },
  placeAddress: {
    fontSize: 13,
    fontFamily: AppFonts.inter.regular,
    color: '#868E96',
  },
  addIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
