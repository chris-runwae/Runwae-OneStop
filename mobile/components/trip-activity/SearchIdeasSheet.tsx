import { useTrips } from '@/context/TripsContext';
import { useTheme } from '@react-navigation/native';
import { Loader2, Search, SlidersHorizontal } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import HotelsSection from '../trips/HotelsSection';
import { TripWithEverything } from '@/hooks/useTripActions';
import { ItemType } from '@/hooks/useItineraryActions';
import {
  loadCategoryProducts,
  CATEGORY_LABELS,
  type CategoryKey,
  LEAF_CATEGORIES,
} from '@/utils/viator/viatorCategoryCache';
import {
  useViatorCategory,
  type MappedViatorIdea,
} from '@/hooks/useViatorCategory';
import { lookupViatorDestinationId } from '@/utils/viator/viatorDestinationLookup';

interface Props {
  visible: boolean;
  onClose: () => void;
  trip: TripWithEverything;
}

const SpinningLoader = ({
  size,
  color,
  style,
}: {
  size: number;
  color: string;
  style?: any;
}) => {
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

export const SEARCH_CATEGORIES = [
  { id: 'All', label: 'All' },
  { id: 'Eat/Drink', label: '🍹 Eat/Drink' },
  { id: 'Stay', label: '🏨 Stay' },
  { id: 'Do', label: '🎭 Do' },
  { id: 'Shop', label: '🛍️ Shop' },
];

interface ViatorCategorySectionProps {
  category: CategoryKey;
  localQuery: string;
  colors: {
    textColors: { default: string; subtle: string };
    [key: string]: any;
  };
  onAdd: (idea: MappedViatorIdea) => void;
  scrollEnabled?: boolean;
  destinationId?: string | null;
}

function ViatorCategorySection({
  category,
  localQuery,
  colors,
  onAdd,
  scrollEnabled = true,
  destinationId,
}: ViatorCategorySectionProps) {
  const { products, loading, error, retry } = useViatorCategory(
    category,
    destinationId
  );

  const filtered = React.useMemo(() => {
    if (!localQuery) return products;
    const q = localQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [products, localQuery]);

  if (loading) {
    return (
      <View style={sectionStyles.center}>
        <SpinningLoader size={28} color="#FF1F8C" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={sectionStyles.center}>
        <Text
          style={[
            sectionStyles.errorText,
            { color: colors.textColors.subtle },
          ]}>
          {error}
        </Text>
        <TouchableOpacity onPress={retry} style={sectionStyles.retryBtn}>
          <Text style={sectionStyles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      scrollEnabled={scrollEnabled}
      data={filtered}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.ideaGridRow}
      contentContainerStyle={styles.ideaGridContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={() => (
        <View style={styles.emptyState}>
          <Text
            style={[
              styles.emptyStateTitle,
              { color: colors.textColors.default },
            ]}>
            No ideas found
          </Text>
          <Text
            style={[styles.emptyStateSub, { color: colors.textColors.subtle }]}>
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
          onAdd={() => onAdd(item)}
          viatorProductCode={item.id}
          price={item.price}
          currency={item.currency}
        />
      )}
    />
  );
}

const sectionStyles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  errorText: {
    fontSize: 14,
    fontFamily: AppFonts.inter.regular,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FF2E92',
    borderRadius: 99,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: AppFonts.inter.semiBold,
  },
});

interface SearchResultGroupProps {
  category: Exclude<CategoryKey, 'All'>;
  localQuery: string;
  colors: {
    textColors: { default: string; subtle: string };
    [key: string]: any;
  };
  onAdd: (idea: MappedViatorIdea) => void;
  destinationId?: string | null;
}

function SearchResultGroup({
  category,
  localQuery,
  colors,
  onAdd,
  destinationId,
}: SearchResultGroupProps) {
  const { products } = useViatorCategory(category, destinationId);
  const q = localQuery.toLowerCase();
  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );

  if (filtered.length === 0) return null;

  return (
    <View>
      <Text
        style={[allStyles.sectionHeader, { color: colors.textColors.default }]}>
        {CATEGORY_LABELS[category]} · {filtered.length} result
        {filtered.length !== 1 ? 's' : ''}
      </Text>
      <FlatList
        scrollEnabled={false}
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.ideaGridRow}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <IdeaCard
            imageUri={item.imageUri}
            categoryLabel={item.categoryLabel}
            title={item.title}
            description={item.description}
            onAdd={() => onAdd(item)}
            viatorProductCode={item.id}
            price={item.price}
            currency={item.currency}
          />
        )}
      />
    </View>
  );
}

interface AllCategoryViewProps {
  localQuery: string;
  colors: {
    textColors: { default: string; subtle: string };
    [key: string]: any;
  };
  onAdd: (idea: MappedViatorIdea) => void;
  destinationId?: string | null;
}

function AllCategoryView({
  localQuery,
  colors,
  onAdd,
  destinationId,
}: AllCategoryViewProps) {
  if (localQuery) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.ideaGridContent}>
        {LEAF_CATEGORIES.map((cat) => (
          <SearchResultGroup
            key={cat}
            category={cat}
            localQuery={localQuery}
            colors={colors}
            onAdd={onAdd}
            destinationId={destinationId}
          />
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      {LEAF_CATEGORIES.map((cat) => (
        <View key={cat} style={allStyles.section}>
          <Text
            style={[
              allStyles.sectionHeader,
              { color: colors.textColors.default },
            ]}>
            {CATEGORY_LABELS[cat]}
          </Text>
          <ViatorCategorySection
            category={cat}
            localQuery=""
            colors={colors}
            onAdd={onAdd}
            scrollEnabled={false}
            destinationId={destinationId}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const allStyles = StyleSheet.create({
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 15,
    fontFamily: AppFonts.inter.semiBold,
    marginBottom: 12,
    marginTop: 4,
  },
});

interface HotelIdeaData {
  name: string;
  hotelId: string;
  address: string;
  roomTypes: unknown[];
  thumbnail?: string | null;
  all_data: unknown;
}

export default function SearchIdeasSheet({ visible, onClose, trip }: Props) {
  const { dark } = useTheme();
  const colors = Colors[dark ? 'dark' : 'light'];
  const { addIdea } = useTrips();
  const [activeCategory, setActiveCategory] = useState<
    'All' | 'Stay' | Exclude<CategoryKey, 'All'>
  >('All');
  const [activeIdeaFilter, setActiveIdeaFilter] = useState<string | null>(null);
  const [localQuery, setLocalQuery] = useState('');
  const [destinationId, setDestinationId] = useState<string | null>(null);

  const translateY = useRef(new Animated.Value(900)).current;

  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [filterAnchor, setFilterAnchor] = useState<
    { top: number; left?: number; right?: number } | undefined
  >(undefined);
  const filterBtnRef = useRef<View>(null);

  const inputRef = useRef<TextInput>(null);

  const ideaType = useMemo(() => {
    return activeCategory === 'Stay' ? 'hotel' : 'activity';
  }, [activeCategory]) as ItemType;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
      setTimeout(() => inputRef.current?.focus(), 150);
      lookupViatorDestinationId(trip.destination_label).then((id) => {
        setDestinationId(id);
        const filters = id ? { destination: id } : {};
        Promise.all([
          loadCategoryProducts('Eat/Drink', filters),
          loadCategoryProducts('Do', filters),
          loadCategoryProducts('Shop', filters),
        ]).catch(() => {
          /* swallow prefetch errors — hooks will retry on mount */
        });
      });
    } else {
      Animated.timing(translateY, {
        toValue: 600,
        duration: 250,
        useNativeDriver: true,
      }).start();
      setLocalQuery('');
      setActiveCategory('All');
      setDestinationId(null);
    }
  }, [visible]);

  const handleSaveIdea = async (idea: MappedViatorIdea | HotelIdeaData) => {
    let input;

    if (ideaType === 'hotel') {
      const hotel = idea as HotelIdeaData;
      const roomTypes = hotel.roomTypes.length;
      input = {
        name: hotel.name,
        type: ideaType,
        location: 'Stay',
        external_id: hotel.hotelId,
        notes: `${hotel.address} | ${roomTypes} room${roomTypes > 1 ? 's' : ''}`,
        all_data: hotel,
        cover_image: hotel.thumbnail || null,
      };
    } else {
      const activity = idea as MappedViatorIdea;
      input = {
        name: activity.title,
        type: ideaType,
        location: activity.category,
        external_id: activity.id,
        notes: activity.description,
        cover_image: activity.imageUri,
        all_data: activity,
      };
    }
    await addIdea(input);
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
    {
      label: 'Must See',
      onPress: () => setActiveIdeaFilter('Must See'),
      isBold: activeIdeaFilter === 'Must See',
    },
    {
      label: 'Hidden Gems',
      onPress: () => setActiveIdeaFilter('Hidden Gems'),
      isBold: activeIdeaFilter === 'Hidden Gems',
    },
    {
      label: 'Free Activities',
      onPress: () => setActiveIdeaFilter('Free Activities'),
      isBold: activeIdeaFilter === 'Free Activities',
    },
    {
      label: 'High Rating',
      onPress: () => setActiveIdeaFilter('High Rating'),
      isBold: activeIdeaFilter === 'High Rating',
    },
    {
      label: 'Recently Added',
      onPress: () => setActiveIdeaFilter('Recently Added'),
      isBold: activeIdeaFilter === 'Recently Added',
    },
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
          <View
            style={[
              styles.handleBar,
              { backgroundColor: dark ? '#374151' : '#D1D5DB' },
            ]}
          />

          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: dark ? '#1F1F1F' : '#ffffff',
                borderColor: dark ? '#374151' : '#EFEFEF',
              },
            ]}>
            <Search
              size={18}
              color={dark ? '#9CA3AF' : '#AEAEAE'}
              style={styles.searchIcon}
            />
            <TextInput
              ref={inputRef}
              value={localQuery}
              onChangeText={setLocalQuery}
              placeholder="Search trips, hotels, experiences..."
              placeholderTextColor={dark ? '#6B7280' : '#AEAEAE'}
              style={[styles.searchInput, { color: colors.textColors.default }]}
            />
            <TouchableOpacity
              ref={filterBtnRef}
              onPress={handleFilterPress}
              hitSlop={10}>
              <SlidersHorizontal
                size={18}
                color={dark ? '#9CA3AF' : '#AEAEAE'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}>
              {SEARCH_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() =>
                      setActiveCategory(
                        cat.id as 'All' | 'Stay' | Exclude<CategoryKey, 'All'>
                      )
                    }
                    style={[
                      styles.categoryPill,
                      {
                        backgroundColor: isActive
                          ? '#FF2E92'
                          : dark
                            ? '#1F1F1F'
                            : '#fff',
                        borderColor: isActive
                          ? '#FF2E92'
                          : dark
                            ? '#374151'
                            : '#EFEFEF',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.categoryPillText,
                        {
                          color: isActive
                            ? '#ffffff'
                            : dark
                              ? '#ADB5BD'
                              : '#6B7280',
                        },
                      ]}>
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {activeCategory === 'Stay' ? (
            <HotelsSection trip={trip} onAdd={handleSaveIdea} />
          ) : activeCategory === 'All' ? (
            <AllCategoryView
              localQuery={localQuery}
              colors={colors}
              onAdd={handleSaveIdea}
              destinationId={destinationId}
            />
          ) : (
            <ViatorCategorySection
              category={activeCategory as Exclude<CategoryKey, 'All'>}
              localQuery={localQuery}
              colors={colors}
              onAdd={handleSaveIdea}
              destinationId={destinationId}
            />
          )}

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
    borderWidth: 1,
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
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 13,
    fontFamily: AppFonts.inter.medium,
    color: '#6B7280',
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
    marginBottom: 8,
  },
  emptyStateSub: {
    fontSize: 14,
    fontFamily: AppFonts.inter.regular,
    textAlign: 'center',
  },
});
