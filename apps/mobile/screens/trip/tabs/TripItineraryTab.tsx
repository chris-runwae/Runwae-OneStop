import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripsContext';
import {
  type ItineraryDayWithItems,
  type ItineraryItem,
  type CreateItineraryItemInput,
  useDayWithTravelTimes,
} from '@/hooks/useItineraryActions';
import { useTheme } from '@react-navigation/native';
import { addDays, format, parseISO } from 'date-fns';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronRight, Ellipsis, Plus } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text as RNText,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DraggableFlatList, {
  type RenderItemParams,
} from 'react-native-draggable-flatlist';

import { Text } from '@/components';
import ActionMenu, { ActionOption } from '@/components/common/ActionMenu';
import AddItineraryItemSheet from '@/components/trip-activity/AddItineraryItemSheet';
import ItineraryItemCard from '@/components/trip-activity/ItineraryItemCard';
import TravelConnector from '@/components/itinerary/TravelConnector';
import { AppFonts, Colors } from '@/constants';
import { useMutation } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';
import { uploadImageFromUri } from '@/lib/uploadImage';

const DATE_COLUMN_WIDTH = 55;

type StripDay = {
  type: 'day';
  id: string;
  label: string;
  sublabel: string;
};
type StripAdd = { type: 'add'; id: 'add' };
type StripItem = StripDay | StripAdd;

type DateStripProps = {
  startDate: string | null;
  days: ItineraryDayWithItems[];
  selectedDayId: string | null;
  onSelectDay: (id: string) => void;
  onAddDay: () => void;
  onReorderDays: (orderedIds: string[]) => Promise<void> | void;
  isMember: boolean;
};

function DateStrip({
  startDate,
  days,
  selectedDayId,
  onSelectDay,
  onAddDay,
  onReorderDays,
  isMember,
}: DateStripProps) {
  const { dark } = useTheme();
  const colors = Colors[dark ? 'dark' : 'light'];

  const items = useMemo<StripItem[]>(() => {
    const base: StripItem[] = days.map((d, i) => {
      const idStr = d._id as unknown as string;
      if (startDate) {
        const date = addDays(parseISO(startDate), i);
        return {
          type: 'day',
          id: idStr,
          label: format(date, 'EEEEE'),
          sublabel: format(date, 'd'),
        };
      }
      return {
        type: 'day',
        id: idStr,
        label: 'D',
        sublabel: String(i + 1),
      };
    });
    base.push({ type: 'add', id: 'add' });
    return base;
  }, [days, startDate]);

  const renderItem = ({ item, drag, isActive }: RenderItemParams<StripItem>) => {
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

    const isSelected = item.id === selectedDayId;
    return (
      <Pressable
        onPress={() => onSelectDay(item.id)}
        onLongPress={isMember ? drag : undefined}
        delayLongPress={220}
        style={[
          styles.dateColumn,
          isActive && {
            transform: [{ scale: 1.08 }],
          },
        ]}>
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
            isActive && {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 6,
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

  const handleDragEnd = ({ data }: { data: StripItem[] }) => {
    const orderedDayIds = data
      .filter((d): d is StripDay => d.type === 'day')
      .map((d) => d.id);
    void onReorderDays(orderedDayIds);
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
      <DraggableFlatList<StripItem>
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onDragEnd={handleDragEnd}
        activationDistance={12}
        dragItemOverflow
        contentContainerStyle={styles.dateStripContent}
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
  onReorderItems: (dayId: string, orderedIds: string[]) => Promise<void> | void;
  onMoveItemToPrevDay?: (itemId: string) => void;
  onMoveItemToNextDay?: (itemId: string) => void;
  onUpdateTitle: (dayId: string, title: string) => Promise<void>;
  onDeleteDay: (day: ItineraryDayWithItems) => void;
  onClearDay: (dayId: string) => void;
  isFirstDay: boolean;
  onItemPress: (item: ItineraryItem) => void;
  onUpdateItemNotes: (itemId: string, notes: string) => void;
  isMember?: boolean;
};

function DaySection({
  day,
  index,
  userId,
  reorderingDayId,
  onAddItem,
  onDeleteItem,
  onReorderItems,
  onMoveItemToPrevDay,
  onMoveItemToNextDay,
  onUpdateTitle,
  onDeleteDay,
  onClearDay,
  onItemPress,
  onUpdateItemNotes,
  isMember = false,
}: DaySectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [titleEdit, setTitleEdit] = useState(false);
  const [titleVal, setTitleVal] = useState(day.title ?? '');
  const [showSheet, setShowSheet] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ top: 0, right: 0 });

  const isReordering = reorderingDayId === (day._id as unknown as string);
  const dayId = day._id as unknown as string;

  // TODO: legs come from the stub query (CLAUDE.md). Will surface real
  // distances/durations once routing.computeLegs lands.
  const dayLegs = useDayWithTravelTimes(day._id as unknown as string);
  const legByFromId = useMemo(() => {
    const map = new Map<
      string,
      { distanceKm?: number; durationMin?: number }
    >();
    if (dayLegs && 'legs' in dayLegs && Array.isArray((dayLegs as any).legs)) {
      for (const leg of (dayLegs as any).legs as Array<{
        fromItemId: string;
        distanceKm?: number;
        durationMin?: number;
      }>) {
        map.set(leg.fromItemId, {
          distanceKm: leg.distanceKm,
          durationMin: leg.durationMin,
        });
      }
    }
    return map;
  }, [dayLegs]);

  const handleTitleBlur = async () => {
    setTitleEdit(false);
    if (titleVal.trim() !== (day.title ?? '')) {
      await onUpdateTitle(dayId, titleVal.trim());
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
      onPress: () => onClearDay(dayId),
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
        <View style={{ gap: 8 }}>
          <DraggableFlatList<ItineraryItem>
            data={day.items}
            keyExtractor={(item) => item._id as unknown as string}
            scrollEnabled={false}
            activationDistance={12}
            dragItemOverflow
            onDragEnd={({ data }) => {
              const orderedIds = data.map(
                (it) => it._id as unknown as string,
              );
              const original = day.items.map(
                (it) => it._id as unknown as string,
              );
              const changed =
                orderedIds.length !== original.length ||
                orderedIds.some((id, i) => id !== original[i]);
              if (changed) {
                void onReorderItems(dayId, orderedIds);
              }
            }}
            renderItem={({ item, drag, isActive, getIndex }) => {
              const i = getIndex() ?? 0;
              const itemId = item._id as unknown as string;
              const leg = legByFromId.get(itemId);
              const showLeg = !isActive && i < day.items.length - 1 && !!leg;
              return (
                <View>
                  <ItineraryItemCard
                    item={item}
                    isReordering={isReordering}
                    isCreator={
                      (item.addedByUserId as unknown as string) === userId
                    }
                    onDelete={() => onDeleteItem(itemId)}
                    onMoveUp={() => {}}
                    onMoveDown={() => {}}
                    onMoveToPrevDay={() => onMoveItemToPrevDay?.(itemId)}
                    onMoveToNextDay={() => onMoveItemToNextDay?.(itemId)}
                    canMoveUp={i > 0}
                    canMoveDown={i < day.items.length - 1}
                    onPress={() => onItemPress(item)}
                    onUpdateNotes={(notes) =>
                      onUpdateItemNotes(itemId, notes)
                    }
                    isMember={isMember}
                    drag={isMember ? drag : undefined}
                    isActive={isActive}
                  />
                  {showLeg ? (
                    <TravelConnector
                      distanceKm={leg?.distanceKm}
                      durationMin={leg?.durationMin}
                    />
                  ) : null}
                </View>
              );
            }}
          />

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
        onSubmit={(input) => onAddItem(dayId, input)}
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

  const generateUrlMut = useMutation(api.users.generateImageUploadUrl);
  const resolveUrlMut = useMutation(api.users.resolveStorageUrl);

  const handleCardPress = (item: ItineraryItem) => {
    if (item.type === 'hotel' && item.apiRef) {
      router.push({
        pathname: '/hotels/[hotelId]',
        params: {
          hotelId: item.apiRef,
          checkin: activeTrip?.startDate,
          checkout: activeTrip?.endDate,
        },
      } as any);
      return;
    }
    if (item.type === 'activity' && item.apiRef) {
      router.push({
        pathname: '/viator/[productCode]',
        params: { productCode: item.apiRef },
      } as any);
      return;
    }
    router.push({
      pathname: '/itinerary/item/[itemId]',
      params: { itemId: item._id as unknown as string },
    });
  };

  const [reorderingDayId, setReorderingDayId] = useState<string | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  const tripStartDate = activeTrip?.startDate ?? null;

  useEffect(() => {
    if (days.length === 0) {
      if (selectedDayId !== null) setSelectedDayId(null);
      return;
    }
    const exists = days.some(
      (d) => (d._id as unknown as string) === selectedDayId,
    );
    if (!exists) {
      setSelectedDayId(days[0]._id as unknown as string);
    }
  }, [days, selectedDayId]);

  const prevDayCountRef = useRef(days.length);
  useEffect(() => {
    if (days.length > prevDayCountRef.current) {
      const last = days[days.length - 1];
      if (last) setSelectedDayId(last._id as unknown as string);
    }
    prevDayCountRef.current = days.length;
  }, [days]);

  const handleAddDay = async () => {
    const nextDayNumber = days.length + 1;
    await addDay({ title: `Day ${nextDayNumber}` });
  };

  const handleAddItem = async (
    dayId: string,
    input: CreateItineraryItemInput,
  ) => {
    let imageUrl = input.imageUrl;
    if (imageUrl?.startsWith('file://')) {
      try {
        imageUrl = await uploadImageFromUri(imageUrl, {
          generateUrl: () => generateUrlMut(),
          resolveUrl: (args) => resolveUrlMut(args),
        });
      } catch (err) {
        imageUrl = undefined;
      }
    }
    await addItem(dayId, { ...input, imageUrl });
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

  const dayIndex = selectedDayId
    ? days.findIndex((d) => (d._id as unknown as string) === selectedDayId)
    : -1;
  const activeDay = dayIndex >= 0 ? days[dayIndex] : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundColors.default }}>
      <DateStrip
        startDate={tripStartDate}
        days={days}
        selectedDayId={selectedDayId}
        onSelectDay={setSelectedDayId}
        onAddDay={handleAddDay}
        onReorderDays={reorderDaysCtx}
        isMember={isMember}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {activeDay ? (
          <DaySection
            key={activeDay._id as unknown as string}
            day={activeDay}
            index={dayIndex}
            userId={user?.id ?? ''}
            reorderingDayId={reorderingDayId}
            onToggleReorder={setReorderingDayId}
            onAddItem={handleAddItem}
            onDeleteItem={removeItem}
            onReorderItems={reorderItemsCtx}
            onMoveItemToPrevDay={async (itemId) => {
              if (dayIndex > 0) {
                const prevDay = days[dayIndex - 1];
                await moveItemToDayCtx(
                  itemId,
                  activeDay._id as unknown as string,
                  prevDay._id as unknown as string,
                );
              }
            }}
            onMoveItemToNextDay={async (itemId) => {
              if (dayIndex < days.length - 1) {
                const nextDay = days[dayIndex + 1];
                await moveItemToDayCtx(
                  itemId,
                  activeDay._id as unknown as string,
                  nextDay._id as unknown as string,
                );
              }
            }}
            onUpdateTitle={(dId, title) => updateDayCtx(dId, { title })}
            onDeleteDay={(d) => removeDay(d._id as unknown as string)}
            onClearDay={(_dId) => {
              for (const it of activeDay.items) {
                void removeItem(it._id as unknown as string);
              }
            }}
            isFirstDay={dayIndex === 0}
            onItemPress={handleCardPress}
            onUpdateItemNotes={(itemId, notes) =>
              updateItemCtx(itemId, { notes })
            }
            isMember={isMember}
          />
        ) : null}

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
