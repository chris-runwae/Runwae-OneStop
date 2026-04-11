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
import { Image } from 'expo-image';
import { ChevronDown, ChevronRight, Ellipsis, Plus } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
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

  const { dark } = useTheme();
  const colors = Colors[dark ? 'dark' : 'light'];

  const renderItem = ({ item: date }: { item: Date }) => {
    const isSelected = isSameDay(date, selectedDate);
    const dayLetter = format(date, 'EEEEE');
    const dayNum = format(date, 'd');

    return (
      <Pressable onPress={() => onSelectDate(date)} style={styles.dateColumn}>
        <Text
          style={[
            styles.dayLetter,
            isSelected ? styles.dayLetterSelected : { color: dark ? '#9BA1A6' : '#AEAEAE' },
          ]}>
          {dayLetter}
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
              isSelected ? styles.dateNumberSelected : { color: dark ? '#ADB5BD' : '#ADB5BD' },
            ]}>
            {dayNum}
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
      ]}
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
          {titleEdit ? (
            <TextInput
              value={titleVal}
              onChangeText={setTitleVal}
              onBlur={handleTitleBlur}
              autoFocus
              style={[styles.titleInput, { color: colors.textColors.default }]}
              onSubmitEditing={handleTitleBlur}
            />
          ) : (
            <Text style={[styles.dayTitle, { color: colors.textColors.default }]}>
              {day.title || `Day ${index + 1}`}
            </Text>
          )}
        </View>
        <Pressable
          hitSlop={12}
          onPress={handleDayMenuPress}
          style={styles.ellipsisBtn}>
          <Ellipsis size={18} strokeWidth={1.5} color={dark ? '#9BA1A6' : '#AEAEAE'} />
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
            style={[styles.addItemPill, { backgroundColor: dark ? '#1F1F1F' : '#FFFFFF', borderColor: dark ? '#374151' : '#F0F0F0' }]}>
            <Plus size={16} color={dark ? '#ADB5BD' : '#000'} />
            <Text style={[styles.addItemPillText, { color: colors.textColors.default }]}>Add</Text>
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
        <RNText style={[styles.emptySubtitle, { color: colors.textColors.subtle }]}>
          Every adventure begins with an empty page. Start planning now.
        </RNText>

        <TouchableOpacity
          onPress={() => addDay({})}
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
          style={[styles.addDayPill, { backgroundColor: dark ? '#1F1F1F' : '#fff', borderColor: dark ? '#374151' : '#E0E0E0' }]}>
          <Plus size={14} color={dark ? '#ADB5BD' : '#AEAEAE'} strokeWidth={2} />
          <Text style={[styles.addDayPillText, { color: dark ? '#ADB5BD' : '#AEAEAE' }]}>Add Day</Text>
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
  addDayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
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
  },
});
