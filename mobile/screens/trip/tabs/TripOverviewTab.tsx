import { useTheme } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Plus, Trash2, MapPin, CalendarPlus } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, ScrollView, View, Pressable, Alert } from 'react-native';

import { TripWithEverything } from '@/hooks/useTripActions';
import { useTrips } from '@/context/TripsContext';
import { AppFonts, Colors } from '@/constants';
import SearchIdeasSheet from '@/components/trip-activity/SearchIdeasSheet';
import { SavedItineraryItem } from '@/hooks/useIdeaActions';

interface Props {
  trip: TripWithEverything;
}

export default function TripOverviewTab({ trip }: Props) {
  const { dark } = useTheme();
  const colors = Colors[dark ? 'dark' : 'light'];
  const { ideas, ideasLoading, removeIdea, addDay, addItem, days } = useTrips();
  const [searchVisible, setSearchVisible] = useState(false);

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

    // Show a picker or just add to Day 1 for now (simplified for this task)
    const firstDay = days[0];
    addItem(firstDay.id, {
      title: idea.title,
      type: idea.type,
      location: idea.location,
      external_id: idea.external_id,
      image_url: idea.image_url,
    });
    Alert.alert('Success', `Added "${idea.title}" to Day 1`);
  };

  const handleDeleteIdea = (id: string) => {
    Alert.alert('Delete Idea', 'Are you sure you want to remove this idea?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeIdea(id) },
    ]);
  };

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
            style={[styles.emptyTitle, { color: dark ? '#ffffff' : '#111827' }]}>
            Start Planning Your Dream Trip
          </Text>
          <Text style={[styles.emptySubtitle, { color: '#ADB5BD' }]}>
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

        <SearchIdeasSheet visible={searchVisible} onClose={() => setSearchVisible(false)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, { color: colors.textColors.default }]}>
          Your Trip Ideas
        </Text>
        <TouchableOpacity
          onPress={() => setSearchVisible(true)}
          style={styles.addBtnSmall}>
          <Plus size={18} color="#FF1F8C" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}>
        {ideas.map((idea) => (
          <View key={idea.id} style={styles.ideaCard}>
            <View style={styles.ideaIconBox}>
              <MapPin size={18} color="#FF1F8C" />
            </View>
            <View style={styles.ideaInfo}>
              <Text style={styles.ideaTitleText}>{idea.title}</Text>
              <Text style={styles.ideaLocationText} numberOfLines={1}>
                {idea.location || 'No location set'}
              </Text>
            </View>
            <View style={styles.ideaActions}>
              <TouchableOpacity
                onPress={() => handleAddToItinerary(idea)}
                style={styles.actionIconBtn}>
                <CalendarPlus size={20} color="#AEAEAE" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteIdea(idea.id)}
                style={styles.actionIconBtn}>
                <Trash2 size={20} color="#FF4D4D" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>

      <SearchIdeasSheet visible={searchVisible} onClose={() => setSearchVisible(false)} />
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
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 20,
    fontFamily: AppFonts.bricolage.semiBold,
    letterSpacing: -0.5,
  },
  addBtnSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  ideaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  ideaIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ideaInfo: {
    flex: 1,
    marginRight: 8,
  },
  ideaTitleText: {
    fontSize: 15,
    fontFamily: AppFonts.inter.semiBold,
    color: '#1A1A1A',
    marginBottom: 2,
  },
  ideaLocationText: {
    fontSize: 13,
    fontFamily: AppFonts.inter.regular,
    color: '#AEAEAE',
  },
  ideaActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
