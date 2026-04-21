import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripsContext';
import { ItineraryDayWithItems } from '@/hooks/useItineraryActions';
import { useTheme } from '@react-navigation/native';
import { addDays, format, parseISO } from 'date-fns';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronRight, Ellipsis, Plus } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text as RNText,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Text } from '@/components';
import ActionMenu, { ActionOption } from '@/components/common/ActionMenu';
import AddItineraryItemSheet from '@/components/trip-activity/AddItineraryItemSheet';
import ItineraryItemCard from '@/components/trip-activity/ItineraryItemCard';
import { AppFonts, Colors } from '@/constants';
import {
  CreateItineraryItemInput,
  ItineraryItem,
} from '@/hooks/useItineraryActions';
import { uploadItineraryItemImage } from '@/utils/supabase/storage';

const DATE_COLUMN_WIDTH = 55;

type DateStripProps = {
  startDate: string | null; // trip_details.start_date e.g. "2026-11-27"
  totalDays: number; // days.length
  selectedIndex: number; // 0-based
  onSelectIndex: (i: number) => void;
  onAddDay: () => void;
};

function DateStrip({
  startDate,
  totalDays,
  selectedIndex,
  onSelectIndex,
  onAddDay,
}: DateStripProps) {
  const flatListRef = useRef<FlatList>(null);
  const { dark } = useTheme();
  const colors = Colors[dark ? 'dark' : 'light'];

  type DayItem = {
    type: 'day';
    index: number;
    label: string;
    sublabel: string;
  };
  type AddItem = { type: 'add' };
  type StripItem = DayItem | AddItem;

  const items = useMemo<StripItem[]>(() => {
    const base: StripItem[] = [];
    for (let i = 0; i < totalDays; i++) {
      if (startDate) {
        const date = addDays(parseISO(startDate), i);
        base.push({
          type: 'day',
          index: i,
          label: format(date, 'EEEEE'),
          sublabel: format(date, 'd'),
        });
      } else {
        base.push({
          type: 'day',
          index: i,
          label: 'D',
          sublabel: String(i + 1),
        });
      }
    }
    base.push({ type: 'add' });
    return base;
  }, [startDate, totalDays]);

  useEffect(() => {
    if (selectedIndex < totalDays) {
      flatListRef.current?.scrollToIndex({
        index: selectedIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [selectedIndex, totalDays]);

  const renderItem = ({ item }: { item: StripItem }) => {
    if (item.type === 'add') {
      return (
        <Pressable onPress={onAddDay} style={styles.dateColumn}>
          <Text
            style={[styles.dayLetter, { color: dark ? '#9BA1A6' : '#AEAEAE' }]}>
            {' '}
          </Text>
          <View
            style={[
              styles.dateCircle,
              {
                backgroundColor: dark ? '#1F1F1F' : '#F8F9FA',
                borderColor: dark ? '#374151' : '#F0F5FA',
                borderStyle: 'dashed',
              },
            ]}>
            <Plus
              size={16}
              color={dark ? '#ADB5BD' : '#AEAEAE'}
              strokeWidth={2}
            />
          </View>
        </Pressable>
      );
    }

    const isSelected = item.index === selectedIndex;
    return (
      <Pressable
        onPress={() => onSelectIndex(item.index)}
        style={styles.dateColumn}>
        <Text
          style={[
            styles.dayLetter,
            isSelected
              ? styles.dayLetterSelected
              : { color: dark ? '#9BA1A6' : '#AEAEAE' },
          ]}>
          {item.label}
        </Text>
        <View
          style={[
            styles.dateCircle,
            isSelected
              ? styles.dateCircleSelected
              : {
                  backgroundColor: dark ? '#1F1F1F' : '#F8F9FA',
                  borderColor: dark ? '#374151' : '#F0F5FA',
                },
          ]}>
          <Text
            style={[
              styles.dateNumber,
              isSelected ? styles.dateNumberSelected : { color: '#ADB5BD' },
            ]}>
            {item.sublabel}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.dateStripContainer,
        {
          backgroundColor: colors.backgroundColors.default,
          borderBottomColor: dark ? '#374151' : '#E0E0E0',
        },
      ]}>
      <FlatList
        ref={flatListRef}
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) =>
          item.type === 'add'
            ? 'add'
            : String((item as { type: 'day'; index: number }).index)
        }
        renderItem={renderItem}
        contentContainerStyle={styles.dateStripContent}
        getItemLayout={(_, index) => ({
          length: DATE_COLUMN_WIDTH,
          offset: DATE_COLUMN_WIDTH * index,
          index,
        })}
        onScrollToIndexFailed={({ index }) => {
          flatListRef.current?.scrollToOffset({
            offset: index * DATE_COLUMN_WIDTH,
            animated: true,
          });
        }}
      />
    </View>
  );
}

type DaySectionProps = {
  day: ItineraryDayWithItems;
  index: number;
  userId: string;
  reorderingDayId: string | null;
  onToggleReorder: (dayId: string | null) => void;
  onAddItem: (dayId: string, input: CreateItineraryItemInput) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onMoveItemUp: (dayId: string, itemId: string) => Promise<void>;
  onMoveItemDown: (dayId: string, itemId: string) => Promise<void>;
  onMoveItemToPrevDay?: (itemId: string) => void;
  onMoveItemToNextDay?: (itemId: string) => void;
  onUpdateTitle: (dayId: string, title: string) => Promise<void>;
  onDeleteDay: (day: ItineraryDayWithItems) => void;
  onClearDay: (dayId: string) => void;
  isFirstDay: boolean;
  onItemPress: (item: ItineraryItem) => void;
  onUpdateItemNotes: (itemId: string, notes: string) => void;
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
  onMoveItemToPrevDay,
  onMoveItemToNextDay,
  onUpdateTitle,
  onDeleteDay,
  onClearDay,
  isFirstDay,
  onItemPress,
  onUpdateItemNotes,
}: DaySectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [titleEdit, setTitleEdit] = useState(false);
  const [titleVal, setTitleVal] = useState(day.title ?? '');
  const [showSheet, setShowSheet] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ top: 0, right: 0 });

  const isReordering = reorderingDayId === day.id;

  const handleTitleBlur = async () => {
    setTitleEdit(false);
    if (titleVal.trim() !== (day.title ?? '')) {
      await onUpdateTitle(day.id, titleVal.trim());
    }
  };

  const handleDayMenuPress = (event: any) => {
    const { pageY } = event.nativeEvent;
    setMenuAnchor({ top: pageY + 10, right: 24 });
    setMenuVisible(true);
  };

  const menuOptions: ActionOption[] = [
    { label: 'Edit Day', onPress: () => setTitleEdit(true) },
    { label: 'Add day before', onPress: () => {} },
    { label: 'Add day after', onPress: () => {} },
    {
      label: 'Clear day',
      onPress: () => onClearDay(day.id),
      isDestructive: true,
      hasSeparator: true,
    },
    {
      label: 'Delete day',
      onPress: () => onDeleteDay(day),
      isDestructive: true,
      isBold: true,
      hasSeparator: true,
    },
  ];

  const { dark } = useTheme();
  const colors = Colors[dark ? 'dark' : 'light'];

  return (
    <View>
      <Pressable
        style={styles.dayHeader}
        onPress={() => setCollapsed((c) => !c)}>
        <View style={styles.dayHeaderLeft}>
          {collapsed ? (
            <ChevronRight size={18} color={dark ? '#9BA1A6' : '#000'} />
          ) : (
            <ChevronDown size={18} color={dark ? '#9BA1A6' : '#000'} />
          )}
          {isMember && titleEdit ? (
            <TextInput
              value={titleVal}
              onChangeText={setTitleVal}
              onBlur={handleTitleBlur}
              autoFocus
              style={[styles.titleInput, { color: colors.textColors.default }]}
              onSubmitEditing={handleTitleBlur}
            />
          ) : (
            <Text
              style={[styles.dayTitle, { color: colors.textColors.default }]}>
              {day.title || `Day ${index + 1}`}
            </Text>
          )}
        </View>
        {isMember && (
          <Pressable
            hitSlop={12}
            onPress={handleDayMenuPress}
            style={styles.ellipsisBtn}>
            <Ellipsis
              size={18}
              strokeWidth={1.5}
              color={dark ? '#9BA1A6' : '#AEAEAE'}
            />
          </Pressable>
        )}
      </Pressable>

      {!collapsed && (
        <View style={{ gap: 15 }}>
          {day.itinerary_items.map((item, i) => (
            <ItineraryItemCard
              key={item.id}
              item={item}
              isReordering={isReordering}
              isCreator={item.created_by === userId}
              onDelete={() => onDeleteItem(item.id)}
              onMoveUp={() => onMoveItemUp(day.id, item.id)}
              onMoveDown={() => onMoveItemDown(day.id, item.id)}
              onMoveToPrevDay={() => onMoveItemToPrevDay?.(item.id)}
              onMoveToNextDay={() => onMoveItemToNextDay?.(item.id)}
              canMoveUp={i > 0}
              canMoveDown={i < day.itinerary_items.length - 1}
              onPress={() => onItemPress(item)}
              onUpdateNotes={(notes) => onUpdateItemNotes(item.id, notes)}
            />
          ))}

          {isMember && (
            <Pressable
              onPress={() => setShowSheet(true)}
              style={[
                styles.addItemPill,
                {
                  backgroundColor: dark ? '#1F1F1F' : '#FFFFFF',
                  borderColor: dark ? '#374151' : '#F0F0F0',
                },
              ]}>
              <Plus size={16} color={dark ? '#ADB5BD' : '#000'} />
              <Text
                style={[
                  styles.addItemPillText,
                  { color: colors.textColors.default },
                ]}>
                Add
              </Text>
            </Pressable>
          )}
        </View>
      )}

      <AddItineraryItemSheet
        visible={showSheet}
        onClose={() => setShowSheet(false)}
        onSubmit={(input) => onAddItem(day.id, input)}
      />

      <ActionMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        options={menuOptions}
        anchorPosition={menuAnchor}
      />
    </View>
  );
}

export default function TripItineraryTab({
  isMember = false,
}: {
  isMember?: boolean;
}) {
  const { dark } = useTheme();
  const colors = Colors[dark ? 'dark' : 'light'];
  const { user } = useAuth();
  const {
    days,
    itineraryLoading,
    activeTrip,
    addDay,
    updateDayCtx,
    removeDay,
    addItem,
    removeItem,
    updateItemCtx,
    reorderItemsCtx,
    reorderDaysCtx,
    moveItemToDayCtx,
  } = useTrips();
  const router = useRouter();

  const handleCardPress = (item: ItineraryItem) => {
    if (item.type === 'hotel' && item.external_id) {
      router.push({
        pathname: '/hotel/[hotelId]',
        params: {
          hotelId: item.external_id,
          tripId: activeTrip?.id ?? '',
        },
      });
      return;
    }
    if (item.type === 'activity' && item.external_id) {
      router.push({
        pathname: '/viator/[productCode]',
        params: { productCode: item.external_id },
      });
      return;
    }
    router.push({
      pathname: '/itinerary/item/[itemId]',
      params: { itemId: item.id },
    });
  };

  const [reorderingDayId, setReorderingDayId] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  const tripStartDate = activeTrip?.trip_details?.start_date ?? null;

  const handleAddDay = async () => {
    const currentLength = days.length; // snapshot before await
    const nextDayNumber = currentLength + 1;
    const nextDate = tripStartDate
      ? format(addDays(parseISO(tripStartDate), currentLength), 'yyyy-MM-dd')
      : undefined;
    await addDay({ title: `Day ${nextDayNumber}`, date: nextDate });
    setSelectedDayIndex(currentLength); // index of the newly added day
  };

  useEffect(() => {
    if (days.length > 0 && selectedDayIndex >= days.length) {
      setSelectedDayIndex(days.length - 1);
    }
  }, [days.length]);

  const handleAddItem = async (
    dayId: string,
    input: CreateItineraryItemInput
  ) => {
    let finalInput = { ...input };
    if (input.image_url?.startsWith('file://')) {
      try {
        const remoteUrl = await uploadItineraryItemImage(
          `${dayId}-${Date.now()}`,
          input.image_url
        );
        finalInput.image_url = remoteUrl;
      } catch (err) {
        finalInput.image_url = null;
      }
    }
    await addItem(dayId, finalInput);
  };

  if (itineraryLoading && days.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#FF1F8C" />
      </View>
    );
  }

  if (!itineraryLoading && days.length === 0) {
    return (
      <View style={styles.emptyStateContainer}>
        <Image
          source={require('@/assets/images/clipboard-empty.png')}
          style={styles.illustration}
          contentFit="contain"
        />
        <RNText
          style={[styles.emptyTitle, { color: dark ? '#ffffff' : '#111827' }]}>
          No itinerary yet
        </RNText>
        <RNText
          style={[styles.emptySubtitle, { color: colors.textColors.subtle }]}>
          Every adventure begins with an empty page. Start planning now.
        </RNText>

        <TouchableOpacity
          onPress={handleAddDay}
          style={[styles.createDayBtn, { backgroundColor: '#FF2E92' }]}
          activeOpacity={0.8}>
          <Plus size={14} color="#ffffff" strokeWidth={2.5} />
          <RNText style={styles.createDayLabel}>Create Day 1</RNText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundColors.default }}>
      <DateStrip
        startDate={tripStartDate}
        totalDays={days.length}
        selectedIndex={selectedDayIndex}
        onSelectIndex={setSelectedDayIndex}
        onAddDay={handleAddDay}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {days
          .filter((_, idx) => idx === selectedDayIndex)
          .map((day) => {
            const dayIndex = selectedDayIndex;
            return (
              <DaySection
                key={day.id}
                day={day}
                index={dayIndex}
                userId={user?.id ?? ''}
                reorderingDayId={reorderingDayId}
                onToggleReorder={setReorderingDayId}
                onAddItem={handleAddItem}
                onDeleteItem={removeItem}
                onMoveItemUp={async (dId, iId) => {
                  const dayItems = day.itinerary_items;
                  const idx = dayItems.findIndex((it) => it.id === iId);
                  if (idx <= 0) return;
                  const newOrder = [...dayItems];
                  [newOrder[idx - 1], newOrder[idx]] = [
                    newOrder[idx],
                    newOrder[idx - 1],
                  ];
                  await reorderItemsCtx(
                    dId,
                    newOrder.map((it) => it.id)
                  );
                }}
                onMoveItemDown={async (dId, iId) => {
                  const dayItems = day.itinerary_items;
                  const idx = dayItems.findIndex((it) => it.id === iId);
                  if (idx < 0 || idx >= dayItems.length - 1) return;
                  const newOrder = [...dayItems];
                  [newOrder[idx], newOrder[idx + 1]] = [
                    newOrder[idx + 1],
                    newOrder[idx],
                  ];
                  await reorderItemsCtx(
                    dId,
                    newOrder.map((it) => it.id)
                  );
                }}
                onMoveItemToPrevDay={async (itemId) => {
                  if (dayIndex > 0) {
                    const prevDay = days[dayIndex - 1];
                    await moveItemToDayCtx(itemId, day.id, prevDay.id);
                  }
                }}
                onMoveItemToNextDay={async (itemId) => {
                  if (dayIndex < days.length - 1) {
                    const nextDay = days[dayIndex + 1];
                    await moveItemToDayCtx(itemId, day.id, nextDay.id);
                  }
                }}
                onUpdateTitle={(dId, title) => updateDayCtx(dId, { title })}
                onDeleteDay={(d) => removeDay(d.id)}
                onClearDay={(dId) => {
                  // For each item in the day, remove it
                  day.itinerary_items.forEach((it) => removeItem(it.id));
                }}
                isFirstDay={dayIndex === 0}
                onItemPress={handleCardPress}
                onUpdateItemNotes={(itemId, notes) =>
                  updateItemCtx(itemId, { notes })
                }
              />
            );
          })}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingVertical: 8 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    minHeight: 250,
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
    marginBottom: 10,
  },
  dateStripContainer: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dateStripContent: { paddingHorizontal: 16 },
  dateColumn: {
    alignItems: 'center',
    width: DATE_COLUMN_WIDTH,
  },
  dayLetter: {
    fontSize: 12,
    fontFamily: AppFonts.inter.regular,
    color: '#AEAEAE',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dayLetterSelected: { color: '#FF1F8C' },
  dateCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#F0F5FA',
  },
  dateCircleSelected: { backgroundColor: '#FF1F8C', borderColor: '#FF1F8C' },
  dateNumber: {
    fontSize: 14,
    fontFamily: AppFonts.inter.regular,
    color: '#ADB5BD',
  },
  dateNumberSelected: { color: '#fff' },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  dayHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dayTitle: {
    fontSize: 14,
  },
  titleInput: {
    fontSize: 18,
    fontFamily: AppFonts.bricolage.semiBold,
    padding: 0,
  },
  ellipsisBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addItemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
    marginTop: 12,
    marginBottom: 16,
  },
  addItemPillText: {
    fontSize: 12,
    fontFamily: AppFonts.inter.medium,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF1F8C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF1F8C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  createDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 99,
    gap: 5,
  },
  createDayLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
