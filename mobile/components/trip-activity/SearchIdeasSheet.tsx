import { useTrips } from '@/context/TripsContext';
import { usePlacesAutocomplete } from '@/hooks/usePlacesAutocomplete';
import { useTheme } from '@react-navigation/native';
import { Loader2, Search, SlidersHorizontal } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { Text } from '@/components';
import { AppFonts, Colors } from '@/constants';
import ActionMenu, { ActionOption } from '@/components/common/ActionMenu';
import IdeaCard from './IdeaCard';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const SpinningLoader = ({ size, color, style }: { size: number; color: string; style?: any }) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[style, { transform: [{ rotate: spin }] }]}>
      <Loader2 size={size} color={color} />
    </Animated.View>
  );
};

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
    isMustSee: true,
    rating: 4.9,
    isFree: false,
    createdAt: '2024-01-01',
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
    isMustSee: false,
    rating: 4.7,
    isFree: false,
    isHiddenGem: true,
    createdAt: '2024-02-01',
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
    isMustSee: false,
    rating: 4.5,
    isFree: true,
    createdAt: '2024-03-01',
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
    isMustSee: true,
    rating: 4.8,
    isFree: false,
    createdAt: '2024-04-01',
  },
  {
    id: '5',
    category: 'Do',
    categoryLabel: '🎭 Do',
    title: 'Sunset Cruise',
    description:
      'Experience breathtaking sunsets while sailing on the serene waters of the bay.',
    imageUri:
      'https://images.unsplash.com/photo-1514886675239-6d654497e875?q=80&w=600&auto=format&fit=crop',
    isMustSee: true,
    rating: 4.9,
    isFree: false,
    createdAt: '2024-05-01',
  },
];

export default function SearchIdeasSheet({ visible, onClose }: Props) {
  const { dark } = useTheme();
  const colors = Colors[dark ? 'dark' : 'light'];
  const { addIdea } = useTrips();
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeIdeaFilter, setActiveIdeaFilter] = useState<string | null>(null);
  const [localQuery, setLocalQuery] = useState('');

  const { query, setQuery, results, loading, clearResults } =
    usePlacesAutocomplete();
  const translateY = useRef(new Animated.Value(900)).current;

  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [filterAnchor, setFilterAnchor] = useState<{ top: number; left?: number; right?: number } | undefined>(undefined);
  const filterBtnRef = useRef<View>(null);

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

  const filteredIdeas = React.useMemo(() => {
    let result = MOCK_IDEAS.filter((idea) => {
      const matchesCategory = activeCategory === 'All' || idea.category === activeCategory;
      const matchesQuery = !localQuery || 
        idea.title.toLowerCase().includes(localQuery.toLowerCase()) || 
        idea.description.toLowerCase().includes(localQuery.toLowerCase()) ||
        idea.category.toLowerCase().includes(localQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });

    if (activeIdeaFilter === 'Must See') {
      result = result.filter(i => (i as any).isMustSee);
    } else if (activeIdeaFilter === 'Hidden Gems') {
      result = result.filter(i => (i as any).isHiddenGem);
    } else if (activeIdeaFilter === 'Free Activities') {
      result = result.filter(i => (i as any).isFree);
    } else if (activeIdeaFilter === 'High Rating') {
      result = [...result].sort((a, b) => (b as any).rating - (a as any).rating);
    } else if (activeIdeaFilter === 'Recently Added') {
      result = [...result].sort((a, b) => new Date((b as any).createdAt).getTime() - new Date((a as any).createdAt).getTime());
    }

    return result;
  }, [activeCategory, localQuery, activeIdeaFilter]);

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

  const handleFilterPress = () => {
    filterBtnRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setFilterAnchor({
        top: pageY + height,
        right: 20, // Align closer to the right edge of the sheet
      });
      setFilterMenuVisible(true);
    });
  };

  const filterOptions: ActionOption[] = [
    { label: 'All Ideas', onPress: () => setActiveIdeaFilter(null) },
    { label: 'Must See', onPress: () => setActiveIdeaFilter('Must See'), isBold: activeIdeaFilter === 'Must See' },
    { label: 'Hidden Gems', onPress: () => setActiveIdeaFilter('Hidden Gems'), isBold: activeIdeaFilter === 'Hidden Gems' },
    { label: 'Free Activities', onPress: () => setActiveIdeaFilter('Free Activities'), isBold: activeIdeaFilter === 'Free Activities' },
    { label: 'High Rating', onPress: () => setActiveIdeaFilter('High Rating'), isBold: activeIdeaFilter === 'High Rating' },
    { label: 'Recently Added', onPress: () => setActiveIdeaFilter('Recently Added'), isBold: activeIdeaFilter === 'Recently Added' },
  ];

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
              <SpinningLoader size={18} color="#FF1F8C" style={styles.loader} />
            ) : (
              <TouchableOpacity ref={filterBtnRef} onPress={handleFilterPress} hitSlop={10}>
                <SlidersHorizontal size={18} color="#AEAEAE" />
              </TouchableOpacity>
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
            data={filteredIdeas}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.ideaGridRow}
            contentContainerStyle={styles.ideaGridContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No ideas found</Text>
                <Text style={styles.emptyStateSub}>
                  Try searching for something else or changing the category.
                </Text>
              </View>
            )}
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

          <ActionMenu
            visible={filterMenuVisible}
            onClose={() => setFilterMenuVisible(false)}
            options={filterOptions}
            anchorPosition={filterAnchor}
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
  emptyState: {
    paddingTop: 60,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontFamily: AppFonts.inter.semiBold,
    color: '#111827',
    marginBottom: 8,
  },
  emptyStateSub: {
    fontSize: 14,
    fontFamily: AppFonts.inter.regular,
    color: '#6B7280',
    textAlign: 'center',
  },
});
