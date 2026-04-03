import { useTrips } from '@/context/TripsContext';
import { usePlacesAutocomplete } from '@/hooks/usePlacesAutocomplete';
import { useTheme } from '@react-navigation/native';
import { Loader2, Search, SlidersHorizontal } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
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
import IdeaCard from './IdeaCard';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const MOCK_CATEGORIES = [
  { id: 'All', label: 'All' },
  { id: 'Eat/Drink', label: '🍹 Eat/Drink' },
  { id: 'Stay', label: '🏨 Stay' },
  { id: 'Do', label: '🎭 Do' },
  { id: 'Shop', label: '🛍️ Shop' },
];

export const MOCK_IDEAS = [
  {
    id: '1',
    category: 'Eat/Drink',
    categoryLabel: '🍹 Eat/Drink',
    title: 'Sunset Cocktails',
    description: 'Savor exotic flavors and stunning views at a beachside bar.',
    imageUri:
      'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '2',
    category: 'Stay',
    categoryLabel: '🏨 Stay',
    title: 'Boutique Hotel',
    description:
      'Rejuvenate your body and mind with amazing room overlooking the serene ocean.',
    imageUri:
      'https://images.unsplash.com/photo-1542314831-c6a4d14b1b36?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '3',
    category: 'Do',
    categoryLabel: '🎭 Do',
    title: 'Local Artisans Market',
    description:
      'Discover handmade crafts and unique souvenirs from talented local artists.',
    imageUri:
      'https://images.unsplash.com/photo-1511216335778-7cb8f49fa7a3?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '4',
    category: 'Shop',
    categoryLabel: '🛍️ Shop',
    title: 'Food Tour',
    description:
      "Embark on a culinary adventure sampling dishes from the region's best eateries.",
    imageUri:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: '5',
    category: 'Attend',
    categoryLabel: '🎟️ Attend',
    title: 'Sunset Cruise',
    description:
      'Experience breathtaking sunsets while sailing on the serene waters of the bay.',
    imageUri:
      'https://images.unsplash.com/photo-1514886675239-6d654497e875?q=80&w=600&auto=format&fit=crop',
  },
];

export default function SearchIdeasSheet({ visible, onClose }: Props) {
  const { dark } = useTheme();
  const colors = Colors[dark ? 'dark' : 'light'];
  const { addIdea } = useTrips();
  const [activeCategory, setActiveCategory] = useState('All');
  const [localQuery, setLocalQuery] = useState('');

  const { query, setQuery, results, loading, clearResults } =
    usePlacesAutocomplete();
  const translateY = useRef(new Animated.Value(900)).current;

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
      setLocalQuery('');
      clearResults();
      setActiveCategory('All');
    }
  }, [visible]);

  const handleSaveMockIdea = async (idea: (typeof MOCK_IDEAS)[0]) => {
    await addIdea({
      name: idea.title,
      type: 'activity',
      location: idea.category,
      external_id: idea.id,
      notes: idea.description,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
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

          <View style={styles.searchContainer}>
            <Search size={18} color="#AEAEAE" style={styles.searchIcon} />
            <TextInput
              ref={inputRef}
              value={localQuery}
              onChangeText={(txt) => {
                setLocalQuery(txt);
                setQuery(txt); // Still power the hook behind the scenes
              }}
              placeholder="Search trips, hotels, experiences..."
              placeholderTextColor="#AEAEAE"
              style={[styles.searchInput, { color: colors.textColors.default }]}
            />
            {loading ? (
              <Loader2 size={18} color="#FF1F8C" style={styles.loader} />
            ) : (
              <SlidersHorizontal size={18} color="#AEAEAE" />
            )}
          </View>

          <View style={styles.categoriesWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}>
              {MOCK_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setActiveCategory(cat.id)}
                    style={[
                      styles.categoryPill,
                      isActive && styles.categoryPillActive,
                    ]}>
                    <Text
                      style={[
                        styles.categoryPillText,
                        isActive && styles.categoryPillTextActive,
                      ]}>
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <FlatList
            data={MOCK_IDEAS.filter(
              (idea) =>
                activeCategory === 'All' || idea.category === activeCategory
            )}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.ideaGridRow}
            contentContainerStyle={styles.ideaGridContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <IdeaCard
                imageUri={item.imageUri}
                categoryLabel={item.categoryLabel}
                title={item.title}
                description={item.description}
                onAdd={() => handleSaveMockIdea(item)}
              />
            )}
          />
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
    backgroundColor: '#D1D5DB', // slightly darker grey based on mockup
    alignSelf: 'center',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: AppFonts.inter.regular,
  },
  loader: {},
  categoriesWrapper: {
    marginHorizontal: -20, // Negative margin to allow ScrollView to stretch full width but item padding manages safety
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  categoryPillActive: {
    backgroundColor: '#FF2E92',
    borderColor: '#FF2E92',
  },
  categoryPillText: {
    fontSize: 13,
    fontFamily: AppFonts.inter.medium,
    color: '#6B7280',
  },
  categoryPillTextActive: {
    color: '#ffffff',
  },
  ideaGridContent: {
    paddingBottom: 40,
  },
  ideaGridRow: {
    justifyContent: 'space-between',
  },
});
