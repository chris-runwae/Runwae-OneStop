import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripsContext';
import { ItineraryDayWithItems } from '@/hooks/useItineraryActions';
import { useTheme } from '@react-navigation/native';
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDate,
  isSameDay,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Ellipsis,
  Plus,
} from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Text } from '@/components';
import ActionMenu, { ActionOption } from '@/components/common/ActionMenu';
import AddItineraryItemSheet from '@/components/trip-activity/AddItineraryItemSheet';
import ItineraryItemCard from '@/components/trip-activity/ItineraryItemCard';
import { AppFonts, Colors } from '@/constants';
import { CreateItineraryItemInput } from '@/hooks/useItineraryActions';
import { uploadItineraryItemImage } from '@/utils/supabase/storage';

const DATE_COLUMN_WIDTH = 55;

type DateStripProps = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

function DateStrip({ selectedDate, onSelectDate }: DateStripProps) {
  const flatListRef = useRef<FlatList>(null);
  const [containerWidth, setContainerWidth] = useState(
    Dimensions.get('window').width
  );
  const hasScrolled = useRef(false);
  const today = useMemo(() => startOfDay(new Date()), []);

  const dates = useMemo(() => {
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    return eachDayOfInterval({ start, end });
  }, [today]);

  const todayIndex = getDate(today) - 1;

  useEffect(() => {
    if (hasScrolled.current) return;
    const timer = setTimeout(() => {
      const offset =
        todayIndex * DATE_COLUMN_WIDTH -
        containerWidth / 2 +
        DATE_COLUMN_WIDTH / 2;
      flatListRef.current?.scrollToOffset({
        offset: Math.max(0, offset),
        animated: false,
      });
      hasScrolled.current = true;
    }, 100);
    return () => clearTimeout(timer);
  }, [containerWidth, todayIndex]);

  const renderItem = ({ item: date }: { item: Date }) => {
    const isSelected = isSameDay(date, selectedDate);
    const dayLetter = format(date, 'EEEEE');
    const dayNum = format(date, 'd');

    return (
      <Pressable onPress={() => onSelectDate(date)} style={styles.dateColumn}>
        <Text
          style={[styles.dayLetter, isSelected && styles.dayLetterSelected]}>
          {dayLetter}
        </Text>
        <View
          style={[styles.dateCircle, isSelected && styles.dateCircleSelected]}>
          <Text
            style={[
              styles.dateNumber,
              isSelected && styles.dateNumberSelected,
            ]}>
            {dayNum}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View
      style={styles.dateStripContainer}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <FlatList
        ref={flatListRef}
        data={dates}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.toISOString()}
        renderItem={renderItem}
        contentContainerStyle={styles.dateStripContent}
        getItemLayout={(_, index) => ({
          length: DATE_COLUMN_WIDTH,
          offset: DATE_COLUMN_WIDTH * index,
          index,
        })}
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
}: DaySectionProps) {
  const [collapsed, setCollapsed] = useState(!isFirstDay);
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

  return (
    <View>
      <Pressable
        style={styles.dayHeader}
        onPress={() => setCollapsed((c) => !c)}>
        <View style={styles.dayHeaderLeft}>
          {collapsed ? (
            <ChevronRight size={18} color="#000" />
          ) : (
            <ChevronDown size={18} color="#000" />
          )}
          {titleEdit ? (
            <TextInput
              value={titleVal}
              onChangeText={setTitleVal}
              onBlur={handleTitleBlur}
              autoFocus
              style={styles.titleInput}
              onSubmitEditing={handleTitleBlur}
            />
          ) : (
            <Text style={styles.dayTitle}>
              {day.title || `Day ${index + 1}`}
            </Text>
          )}
        </View>
        <Pressable
          hitSlop={12}
          onPress={handleDayMenuPress}
          style={styles.ellipsisBtn}>
          <Ellipsis size={18} strokeWidth={1.5} color="#AEAEAE" />
        </Pressable>
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
            />
          ))}

          <Pressable
            onPress={() => setShowSheet(true)}
            style={styles.addItemPill}>
            <Plus size={16} color="#000" />
            <Text style={styles.addItemPillText}>Add</Text>
          </Pressable>
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

export default function TripItineraryTab() {
  const { dark } = useTheme();
  const colors = Colors[dark ? 'dark' : 'light'];
  const { user } = useAuth();
  const {
    days,
    itineraryLoading,
    addDay,
    updateDayCtx,
    removeDay,
    addItem,
    removeItem,
    reorderItemsCtx,
    reorderDaysCtx,
    moveItemToDayCtx,
  } = useTrips();

  const [reorderingDayId, setReorderingDayId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(
    startOfDay(new Date())
  );

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
      <View style={styles.centered}>
        <CalendarDays
          size={52}
          strokeWidth={1}
          color={dark ? '#4b5563' : '#d1d5db'}
        />
        <Text style={styles.emptyHeading}>No itinerary yet</Text>
        <Text style={styles.emptySubtext}>
          Start planning your trip day by day
        </Text>
        <Pressable onPress={() => addDay({})} style={styles.createDayBtn}>
          <Plus size={16} color="#fff" />
          <Text style={styles.createDayLabel}>Create Day 1</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <DateStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {days.map((day, index) => (
          <DaySection
            key={day.id}
            day={day}
            index={index}
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
              if (index > 0) {
                const prevDay = days[index - 1];
                await moveItemToDayCtx(itemId, day.id, prevDay.id);
              }
            }}
            onMoveItemToNextDay={async (itemId) => {
              if (index < days.length - 1) {
                const nextDay = days[index + 1];
                await moveItemToDayCtx(itemId, day.id, nextDay.id);
              }
            }}
            onUpdateTitle={(dId, title) => updateDayCtx(dId, { title })}
            onDeleteDay={(d) => removeDay(d.id)}
            onClearDay={(dId) => {
              // For each item in the day, remove it
              day.itinerary_items.forEach((it) => removeItem(it.id));
            }}
            isFirstDay={index === 0}
          />
        ))}

        <Pressable
          onPress={() => addDay({ title: `Day ${days.length + 1}` })}
          style={styles.addDayPill}>
          <Plus size={14} color="#AEAEAE" strokeWidth={2} />
          <Text style={styles.addDayPillText}>Add Day</Text>
        </Pressable>

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
    // padding: 40,
  },
  dateStripContainer: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  dateStripContent: { paddingHorizontal: 16 },
  dateColumn: {
    alignItems: 'center',
    width: DATE_COLUMN_WIDTH,
  },
  dayLetter: {
    fontSize: 10,
    fontFamily: AppFonts.inter.medium,
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
  },
  dateCircleSelected: { backgroundColor: '#FF1F8C' },
  dateNumber: {
    fontSize: 14,
    fontFamily: AppFonts.inter.semiBold,
    color: '#000',
  },
  dateNumberSelected: { color: '#fff' },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingHorizontal: 16,
    paddingVertical: 5,
  },
  dayHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dayTitle: {
    fontSize: 14,
    // fontFamily: AppFonts.bricolage.semiBold,
    color: '#000',
  },
  titleInput: {
    fontSize: 18,
    fontFamily: AppFonts.bricolage.semiBold,
    color: '#000',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
    marginTop: 12,
    marginBottom: 16,
  },
  addItemPillText: {
    fontSize: 12,
    fontFamily: AppFonts.inter.medium,
    color: '#000',
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
  emptyHeading: {
    fontSize: 18,
    fontFamily: AppFonts.bricolage.semiBold,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
  },
  createDayBtn: {
    backgroundColor: '#FF1F8C',
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createDayLabel: {
    color: '#fff',
    fontSize: 14,
    fontFamily: AppFonts.bricolage.semiBold,
  },
  addDayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 99,
    paddingVertical: 10,
    width: 110,
    alignSelf: 'flex-start',
    marginTop: 20,
    borderStyle: 'dashed',
  },
  addDayPillText: {
    fontSize: 13,
    fontFamily: AppFonts.inter.medium,
    color: '#AEAEAE',
  },
});
