import { useTheme } from '@react-navigation/native';
import { Image } from 'expo-image';
import { ChevronDown, Plus } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

import ActionMenu, { ActionOption } from '@/components/common/ActionMenu';
import AddToItinerarySheet from '@/components/trip-activity/AddToItinerarySheet';
import IdeaCard from '@/components/trip-activity/IdeaCard';
import SearchIdeasSheet, {
  MOCK_CATEGORIES,
  MOCK_IDEAS,
} from '@/components/trip-activity/SearchIdeasSheet';
import { AppFonts, Colors } from '@/constants';
import { useTrips } from '@/context/TripsContext';
import { SavedItineraryItem } from '@/hooks/useIdeaActions';
import { TripWithEverything } from '@/hooks/useTripActions';

interface Props {
  trip: TripWithEverything;
}

const getCategoryWithEmoji = (category: string | null) => {
  if (!category) return '💡 Idea';
  const c = category.toLowerCase();
  if (c.includes('eat') || c.includes('drink')) return '🍹 Eat/Drink';
  if (c.includes('stay')) return '🏨 Stay';
  if (c.includes('do')) return '🎭 Do';
  if (c.includes('shop')) return '🛍️ Shop';
  if (c.includes('attend')) return '🎫 Attend';
  return `💡 ${category}`;
};

export default function TripOverviewTab({ trip }: Props) {
  const { dark } = useTheme();
  const colors = Colors[dark ? 'dark' : 'light'];
  const { ideas, ideasLoading, removeIdea, addDay, addItem, days } = useTrips();
  const [searchVisible, setSearchVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<SavedItineraryItem | null>(
    null
  );
  const [menuAnchor, setMenuAnchor] = useState<
    { top: number; right?: number; left?: number } | undefined
  >(undefined);

  const [activeFilter, setActiveFilter] = useState('All');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [filterAnchor, setFilterAnchor] = useState<
    { top: number; right?: number; left?: number } | undefined
  >(undefined);
  const filterBtnRef = useRef<View>(null);

  const [showAddToItinerarySheet, setShowAddToItinerarySheet] = useState(false);

  const handleAddToItinerary = (idea: SavedItineraryItem) => {
    if (days.length === 0) {
      Alert.alert(
        'No Days',
        'You need to create at least one day in your itinerary first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Itinerary', onPress: () => {} }, // Parent logic handles tab switching
        ]
      );
      return;
    }

    setSelectedIdea(idea);
    setShowAddToItinerarySheet(true);
  };

  const handleDeleteIdea = (id: string) => {
    Alert.alert('Delete Idea', 'Are you sure you want to remove this idea?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeIdea(id) },
    ]);
  };

  const actionOptions: ActionOption[] = [
    {
      label: 'View Details',
      onPress: () => {
        if (selectedIdea?.external_id) {
          router.push({
            pathname: '/experience/[id]',
            params: { id: selectedIdea.external_id },
          });
        }
      },
    },
    {
      label: 'Add to Itinerary',
      onPress: () => {
        if (selectedIdea) handleAddToItinerary(selectedIdea);
      },
    },
    {
      label: 'Remove',
      isDestructive: true,
      hasSeparator: true,
      onPress: () => {
        if (selectedIdea) handleDeleteIdea(selectedIdea.id);
      },
    },
  ];

  const filterOptions: ActionOption[] = MOCK_CATEGORIES.map((cat) => ({
    label: cat.label,
    isBold: activeFilter === cat.id,
    onPress: () => {
      setActiveFilter(cat.id);
      setFilterMenuVisible(false);
    },
  }));

  const filteredIdeas =
    activeFilter === 'All'
      ? ideas
      : ideas.filter((idea) => idea.location === activeFilter);

  if (ideas.length === 0 && !ideasLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <Image
            source={require('@/assets/images/clipboard-empty.png')}
            style={styles.illustration}
            contentFit="contain"
          />
          <Text
            style={[
              styles.emptyTitle,
              { color: dark ? '#ffffff' : '#111827' },
            ]}>
            Start Planning Your Dream Trip
          </Text>
          <Text
            style={[styles.emptySubtitle, { color: colors.textColors.subtle }]}>
            Looking for what to do? Add them to Ideas now.
          </Text>

          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: '#FF2E92' }]}
            activeOpacity={0.8}
            onPress={() => setSearchVisible(true)}>
            <Plus size={14} color="#ffffff" strokeWidth={2.5} />
            <Text style={styles.searchButtonText}>Start Searching</Text>
          </TouchableOpacity>
        </View>

        <SearchIdeasSheet
          visible={searchVisible}
          onClose={() => setSearchVisible(false)}
          trip={trip}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
      <View style={styles.listHeader}>
        <TouchableOpacity
          ref={filterBtnRef}
          onPress={() => {
            if (filterBtnRef.current) {
              filterBtnRef.current.measure(
                (
                  x: number,
                  y: number,
                  width: number,
                  height: number,
                  pageX: number,
                  pageY: number
                ) => {
                  setFilterAnchor({
                    top: pageY + height + 8, // Place right below the button
                    left: pageX, // align perfectly with the left edge of the button
                  });
                  setFilterMenuVisible(true);
                }
              );
            } else {
              setFilterMenuVisible(true);
            }
          }}
          style={styles.filterBtn}>
          <Text
            style={[styles.filterText, { color: colors.textColors.subtle }]}>
            {activeFilter === 'All'
              ? 'All'
              : MOCK_CATEGORIES.find((c) => c.id === activeFilter)?.label ||
                'All'}
          </Text>
          <ChevronDown
            size={14}
            color={dark ? '#9CA3AF' : '#6B7280'}
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSearchVisible(true)}
          style={[
            styles.addPillBtn,
            {
              backgroundColor: dark ? '#1F1F1F' : '#fff',
              borderColor: dark ? '#374151' : '#EFEFEF',
            },
          ]}>
          <Text
            style={[styles.addPillText, { color: colors.textColors.default }]}>
            + Add
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.ideaGridContent}>
        {filteredIdeas.map((item) => (
          <IdeaCard
            key={item.id}
            item={item}
            imageUri={
              item.cover_image ||
              MOCK_IDEAS.find((m) => m.id === item.external_id)?.imageUri ||
              'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=600'
            }
            categoryLabel={getCategoryWithEmoji(item.location)}
            title={item.name}
            description={item.notes || ''}
            onOptionsPress={(position: {
              top: number;
              right?: number;
              left?: number;
            }) => {
              setSelectedIdea(item);
              setMenuAnchor(position);
              setMenuVisible(true);
            }}
            checkin={trip.trip_details?.start_date}
            checkout={trip.trip_details?.end_date}
            adults={trip.group_members?.length ?? 1}
          />
        ))}
      </View>

      <SearchIdeasSheet
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        trip={trip}
      />

      <AddToItinerarySheet
        visible={showAddToItinerarySheet}
        onClose={() => setShowAddToItinerarySheet(false)}
        idea={selectedIdea}
        days={days}
        onSubmit={async (
          dayId: string,
          startTime?: string | null,
          endTime?: string | null
        ) => {
          if (!selectedIdea) return;
          await addItem(dayId, {
            title: selectedIdea.name,
            type: selectedIdea.type as any, // Cast to ItemType
            location: selectedIdea.location,
            external_id: selectedIdea.external_id,
            image_url: selectedIdea.image_url,
            start_time: startTime,
            end_time: endTime,
          });
        }}
      />

      <ActionMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        options={actionOptions}
        anchorPosition={menuAnchor}
      />
      <ActionMenu
        visible={filterMenuVisible}
        onClose={() => setFilterMenuVisible(false)}
        options={filterOptions}
        anchorPosition={filterAnchor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 400,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingHorizontal: 32,
  },
  illustration: {
    width: 50,
    height: 49,
    marginBottom: 24,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 5,
    paddingHorizontal: 20,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 10,
    borderRadius: 99,
    gap: 5,
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },

  // List Styles
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    fontSize: 12,
    fontFamily: AppFonts.inter.medium,
  },
  addPillBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1,
  },
  addPillText: {
    fontSize: 12,
    fontFamily: AppFonts.inter.regular,
  },
  ideaGridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 100, // accommodate FAR tab
  },
});
