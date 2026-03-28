import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripsContext';
import { ItineraryDayWithItems, ItineraryItem } from '@/hooks/useItineraryActions';
import { useTheme } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { CalendarDays, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import AddItineraryItemSheet from '@/components/trip-activity/AddItineraryItemSheet';
import ItineraryItemCard from '@/components/trip-activity/ItineraryItemCard';
import { Text } from '@/components';
import { Colors } from '@/constants';
import { CreateItineraryItemInput } from '@/hooks/useItineraryActions';

// ================================================================
// Day cost helper
// ================================================================

function dayTotalCost(day: ItineraryDayWithItems): number {
  return day.itinerary_items.reduce(
    (sum, item) => sum + (item.cost ?? 0),
    0,
  );
}

function formatDayCost(cost: number, currency = 'GBP'): string | null {
  if (cost === 0) return null;
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(cost);
  } catch {
    return `${cost}`;
  }
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    return format(parseISO(dateStr), 'EEE, MMM d');
  } catch {
    return dateStr;
  }
}

// ================================================================
// DaySection
// ================================================================

type DaySectionProps = {
  day: ItineraryDayWithItems;
  index: number;
  totalDays: number;
  userId: string;
  reorderingDayId: string | null;
  onToggleReorder: (dayId: string | null) => void;
  onAddItem: (dayId: string, input: CreateItineraryItemInput) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onMoveItemUp: (dayId: string, itemId: string) => Promise<void>;
  onMoveItemDown: (dayId: string, itemId: string) => Promise<void>;
  onUpdateTitle: (dayId: string, title: string) => Promise<void>;
  onDeleteDay: (day: ItineraryDayWithItems) => void;
  isLastDay: boolean;
};

function DaySection({
  day,
  index,
  userId,
  reorderingDayId,
  onToggleReorder,
  onAddItem,
  onDeleteItem,
  onMoveItemUp,
  onMoveItemDown,
  onUpdateTitle,
  onDeleteDay,
  isLastDay,
}: DaySectionProps) {
  const { dark } = useTheme();
  const colorScheme = dark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  const [collapsed,   setCollapsed]   = useState(false);
  const [titleEdit,   setTitleEdit]   = useState(false);
  const [titleVal,    setTitleVal]    = useState(day.title ?? '');
  const [showSheet,   setShowSheet]   = useState(false);

  const isReordering = reorderingDayId === day.id;
  const totalCost = dayTotalCost(day);
  const dayCostLabel = formatDayCost(totalCost);
  const dateLabel = formatDate(day.date);

  const handleTitleBlur = async () => {
    setTitleEdit(false);
    if (titleVal.trim() !== (day.title ?? '')) {
      await onUpdateTitle(day.id, titleVal.trim());
    }
  };

  const handleAddItem = async (input: CreateItineraryItemInput) => {
    await onAddItem(day.id, input);
  };

  const handleLongPress = () => {
    if (day.itinerary_items.length < 2) return;
    onToggleReorder(isReordering ? null : day.id);
  };

  return (
    <View
      style={[
        styles.daySection,
        {
          backgroundColor: colors.backgroundColors.default,
          borderColor: colors.borderColors.subtle,
        },
      ]}>
      {/* Day header */}
      <Pressable
        style={styles.dayHeader}
        onPress={() => setCollapsed((c) => !c)}
        onLongPress={handleLongPress}
        delayLongPress={400}>

        {/* Left: day number + date */}
        <View style={styles.dayLeft}>
          <View
            style={[
              styles.dayNumberBadge,
              { backgroundColor: '#FF1F8C' + '15' },
            ]}>
            <Text style={[styles.dayNumberText, { color: '#FF1F8C' }]}>
              {index + 1}
            </Text>
          </View>
          <View>
            {titleEdit ? (
              <TextInput
                value={titleVal}
                onChangeText={setTitleVal}
                onBlur={handleTitleBlur}
                autoFocus
                style={[
                  styles.titleInput,
                  { color: colors.textColors.default },
                ]}
                onSubmitEditing={handleTitleBlur}
              />
            ) : (
              <Pressable onPress={() => setTitleEdit(true)}>
                <Text
                  style={[
                    styles.dayTitle,
                    { color: colors.textColors.default },
                  ]}>
                  {day.title || `Day ${index + 1}`}
                </Text>
              </Pressable>
            )}
            {dateLabel ? (
              <Text
                style={[
                  styles.dayDate,
                  { color: colors.textColors.subtle },
                ]}>
                {dateLabel}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Right: cost + reorder indicator + chevron */}
        <View style={styles.dayRight}>
          {dayCostLabel ? (
            <Text style={[styles.dayCost, { color: colors.textColors.subtle }]}>
              {dayCostLabel}
            </Text>
          ) : null}

          {isReordering ? (
            <Pressable
              onPress={() => onToggleReorder(null)}
              style={[
                styles.doneBtn,
                { borderColor: '#FF1F8C' },
              ]}>
              <Text style={{ fontSize: 11, color: '#FF1F8C', fontFamily: 'BricolageGrotesque-SemiBold' }}>
                Done
              </Text>
            </Pressable>
          ) : (
            <>
              <Text
                style={[
                  styles.itemCount,
                  { color: colors.textColors.subtle },
                ]}>
                {day.itinerary_items.length}
              </Text>
              {collapsed
                ? <ChevronRight size={16} color={colors.textColors.subtle} />
                : <ChevronDown  size={16} color={colors.textColors.subtle} />
              }
            </>
          )}

          {!isLastDay && (
            <Pressable
              hitSlop={8}
              onPress={() => onDeleteDay(day)}>
              <Trash2 size={14} color={colors.textColors.subtle} />
            </Pressable>
          )}
        </View>
      </Pressable>

      {/* Items */}
      {!collapsed && (
        <View style={styles.itemsContainer}>
          {day.itinerary_items.length === 0 ? (
            <Text
              style={[
                styles.emptyDayText,
                { color: colors.textColors.subtle },
              ]}>
              Nothing planned yet — tap + to add
            </Text>
          ) : (
            day.itinerary_items.map((item, i) => (
              <ItineraryItemCard
                key={item.id}
                item={item}
                isReordering={isReordering}
                isCreator={item.created_by === userId}
                onDelete={() => onDeleteItem(item.id)}
                onMoveUp={() => onMoveItemUp(day.id, item.id)}
                onMoveDown={() => onMoveItemDown(day.id, item.id)}
                canMoveUp={i > 0}
                canMoveDown={i < day.itinerary_items.length - 1}
              />
            ))
          )}

          {/* Add item */}
          <Pressable
            onPress={() => setShowSheet(true)}
            style={[
              styles.addItemBtn,
              {
                borderColor: colors.borderColors.subtle,
              },
            ]}>
            <Plus size={14} color={colors.textColors.subtle} />
            <Text
              style={[
                styles.addItemLabel,
                { color: colors.textColors.subtle },
              ]}>
              Add item
            </Text>
          </Pressable>
        </View>
      )}

      <AddItineraryItemSheet
        visible={showSheet}
        onClose={() => setShowSheet(false)}
        onSubmit={handleAddItem}
      />
    </View>
  );
}

// ================================================================
// TripItineraryTab
// ================================================================

export default function TripItineraryTab() {
  const { dark } = useTheme();
  const colorScheme = dark ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  const { user } = useAuth();
  const userId = user?.id ?? '';

  const {
    activeTrip,
    days,
    itineraryLoading,
    refreshItinerary,
    addDay,
    updateDayCtx,
    removeDay,
    addItem,
    removeItem,
    reorderItemsCtx,
  } = useTrips();

  const [refreshing,      setRefreshing]      = useState(false);
  const [reorderingDayId, setReorderingDayId] = useState<string | null>(null);

  // ----------------------------------------------------------------
  // Pull to refresh
  // ----------------------------------------------------------------

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshItinerary();
    setRefreshing(false);
  };

  // ----------------------------------------------------------------
  // Day actions
  // ----------------------------------------------------------------

  const handleAddDay = async () => {
    await addDay({});
  };

  const handleUpdateTitle = async (dayId: string, title: string) => {
    await updateDayCtx(dayId, { title: title || null });
  };

  const handleDeleteDay = (day: ItineraryDayWithItems) => {
    if (days.length <= 1) return; // guard: never delete last day

    const hasItems = day.itinerary_items.length > 0;

    if (!hasItems) {
      removeDay(day.id);
      return;
    }

    Alert.alert(
      `Delete Day ${days.indexOf(day) + 1}?`,
      `This day has ${day.itinerary_items.length} item${day.itinerary_items.length === 1 ? '' : 's'}. They will all be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete day and all items',
          style: 'destructive',
          onPress: () => removeDay(day.id),
        },
      ],
    );
  };

  // ----------------------------------------------------------------
  // Item actions
  // ----------------------------------------------------------------

  const handleAddItem = async (
    dayId: string,
    input: CreateItineraryItemInput,
  ) => {
    await addItem(dayId, input);
  };

  const handleDeleteItem = async (itemId: string) => {
    Alert.alert('Delete item?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeItem(itemId),
      },
    ]);
  };

  const handleMoveItemUp = async (dayId: string, itemId: string) => {
    const day = days.find((d) => d.id === dayId);
    if (!day) return;
    const items = day.itinerary_items;
    const idx = items.findIndex((it) => it.id === itemId);
    if (idx <= 0) return;
    const newOrder = [...items];
    [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    await reorderItemsCtx(dayId, newOrder.map((it) => it.id));
  };

  const handleMoveItemDown = async (dayId: string, itemId: string) => {
    const day = days.find((d) => d.id === dayId);
    if (!day) return;
    const items = day.itinerary_items;
    const idx = items.findIndex((it) => it.id === itemId);
    if (idx < 0 || idx >= items.length - 1) return;
    const newOrder = [...items];
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    await reorderItemsCtx(dayId, newOrder.map((it) => it.id));
  };

  // ----------------------------------------------------------------
  // Loading state
  // ----------------------------------------------------------------

  if (itineraryLoading && days.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#FF1F8C" />
      </View>
    );
  }

  // ----------------------------------------------------------------
  // Empty state
  // ----------------------------------------------------------------

  if (!itineraryLoading && days.length === 0) {
    return (
      <View style={styles.centered}>
        <CalendarDays
          size={52}
          strokeWidth={1}
          color={dark ? '#4b5563' : '#d1d5db'}
        />
        <Text
          style={[
            styles.emptyHeading,
            { color: dark ? '#ffffff' : '#111827' },
          ]}>
          No itinerary yet
        </Text>
        <Text
          style={[
            styles.emptySubtext,
            { color: dark ? '#6b7280' : '#9ca3af' },
          ]}>
          Start planning your trip day by day
        </Text>
        <Pressable
          onPress={handleAddDay}
          style={styles.createDayBtn}>
          <Plus size={16} color="#fff" />
          <Text style={styles.createDayLabel}>Create Day 1</Text>
        </Pressable>
      </View>
    );
  }

  // ----------------------------------------------------------------
  // Main render
  // ----------------------------------------------------------------

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.backgroundColors.default }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#FF1F8C"
        />
      }>

      {days.map((day, index) => (
        <DaySection
          key={day.id}
          day={day}
          index={index}
          totalDays={days.length}
          userId={userId}
          reorderingDayId={reorderingDayId}
          onToggleReorder={setReorderingDayId}
          onAddItem={handleAddItem}
          onDeleteItem={handleDeleteItem}
          onMoveItemUp={handleMoveItemUp}
          onMoveItemDown={handleMoveItemDown}
          onUpdateTitle={handleUpdateTitle}
          onDeleteDay={handleDeleteDay}
          isLastDay={days.length === 1}
        />
      ))}

      {/* Add Day */}
      <Pressable
        onPress={handleAddDay}
        style={[
          styles.addDayBtn,
          { borderColor: colors.borderColors.subtle },
        ]}>
        <Plus size={16} color={colors.textColors.subtle} />
        <Text
          style={[
            styles.addDayLabel,
            { color: colors.textColors.subtle },
          ]}>
          Add Day
        </Text>
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ================================================================
// Styles
// ================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyHeading: {
    fontSize: 17,
    fontFamily: 'BricolageGrotesque-SemiBold',
    textAlign: 'center',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  createDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF1F8C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  createDayLabel: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'BricolageGrotesque-SemiBold',
  },
  // Day section
  daySection: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    gap: 8,
  },
  dayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dayNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dayNumberText: {
    fontSize: 13,
    fontFamily: 'BricolageGrotesque-Bold',
  },
  dayTitle: {
    fontSize: 15,
    fontFamily: 'BricolageGrotesque-SemiBold',
  },
  titleInput: {
    fontSize: 15,
    fontFamily: 'BricolageGrotesque-SemiBold',
    padding: 0,
    margin: 0,
    minWidth: 120,
  },
  dayDate: {
    fontSize: 12,
    marginTop: 1,
  },
  dayRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayCost: {
    fontSize: 12,
    fontFamily: 'BricolageGrotesque-Medium',
  },
  itemCount: {
    fontSize: 12,
    fontFamily: 'BricolageGrotesque-Medium',
  },
  doneBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  itemsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  emptyDayText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
    fontStyle: 'italic',
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 4,
  },
  addItemLabel: {
    fontSize: 13,
    fontFamily: 'BricolageGrotesque-Medium',
  },
  // Add Day button
  addDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 4,
  },
  addDayLabel: {
    fontSize: 14,
    fontFamily: 'BricolageGrotesque-Medium',
  },
});
