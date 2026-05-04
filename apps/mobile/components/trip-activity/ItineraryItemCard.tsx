import { Image } from 'expo-image';
import {
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Ellipsis,
  ImageIcon,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { ScaleDecorator } from 'react-native-draggable-flatlist';

import { Text } from '@/components';
import ActionMenu, { ActionOption } from '@/components/common/ActionMenu';
import { AppFonts, COLORS, Colors } from '@/constants';
import { useDirections } from '@/hooks/useDirections';
import { ItemType, ItineraryItem } from '@/hooks/useItineraryActions';

type TypeConfig = {
  label: string;
  emoji: string;
};

const TYPE_CONFIG: Record<ItemType, TypeConfig> = {
  flight: { label: 'Flight', emoji: '✈️' },
  hotel: { label: 'Stay', emoji: '🏨' },
  tour: { label: 'Tour', emoji: '🚢' },
  car_rental: { label: 'Car', emoji: '🚙' },
  activity: { label: 'Relax', emoji: '🏝' },
  restaurant: { label: 'Dine', emoji: '🍽' },
  transport: { label: 'Transport', emoji: '🚗' },
  event: { label: 'Event', emoji: '🎫' },
  other: { label: 'Other', emoji: '📌' },
};

type Props = {
  item: ItineraryItem;
  isReordering: boolean;
  isCreator: boolean;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveToPrevDay?: () => void;
  onMoveToNextDay?: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onPress?: () => void;
  onUpdateNotes?: (notes: string) => void;
  isMember?: boolean;
  drag?: () => void;
  isActive?: boolean;
};

const ItineraryItemCard = ({
  item,
  isReordering,
  isCreator,
  onDelete,
  onMoveUp,
  onMoveDown,
  onMoveToPrevDay,
  onMoveToNextDay,
  canMoveUp,
  canMoveDown,
  onPress,
  onUpdateNotes,
  isMember = true,
  drag,
  isActive,
}: Props) => {
  const { openDirections } = useDirections();
  const colorScheme = useColorScheme() ?? 'light';
  const dark = colorScheme === 'dark';
  const colors = Colors[colorScheme];
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ top: 0, right: 0 });
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [notesText, setNotesText] = useState(item.notes ?? '');

  useEffect(() => {
    setNotesText(item.notes ?? '');
  }, [item.notes]);

  const openNotesModal = () => {
    setMenuVisible(false);
    setNotesModalVisible(true);
  };

  const handleSaveNotes = () => {
    onUpdateNotes?.(notesText);
    setNotesModalVisible(false);
  };

  const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.other;

  const displayImageUrl = item.imageUrl || null;

  const hasImage = !!displayImageUrl;

  const handleOptionsPress = (event: any) => {
    if (!isCreator || !isMember) return;
    const { pageY } = event.nativeEvent;
    setMenuAnchor({ top: pageY + 10, right: 24 });
    setMenuVisible(true);
  };

  const menuOptions: ActionOption[] = [
    { label: 'View notes', onPress: openNotesModal },
    { label: 'Adjust', onPress: () => {} },
    { label: 'Move to previous day', onPress: onMoveToPrevDay || (() => {}) },
    { label: 'Move to next day', onPress: onMoveToNextDay || (() => {}) },
    {
      label: 'Remove',
      onPress: onDelete,
      isDestructive: true,
      isBold: true,
      hasSeparator: true,
    },
  ];

  const hasMapTarget = !!(item.locationName || item.coords);
  const handleOpenInMaps = () => {
    if (!hasMapTarget) return;
    const location =
      item.locationName ??
      (item.coords ? `${item.coords.lat},${item.coords.lng}` : '');
    if (!location) return;
    openDirections({ title: item.title, location });
  };

  const cardInner = (
    <View>
      <Pressable
        onPress={!isReordering ? onPress : undefined}
        onLongPress={drag}
        delayLongPress={220}
        style={({ pressed }) => [
          { opacity: pressed && !isReordering && onPress ? 0.75 : 1 },
        ]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.backgroundColors.default,
              borderColor: dark ? COLORS.gray[750] : '#EEEEEE',
            },
            isActive && {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: dark ? 0.45 : 0.12,
              shadowRadius: 12,
              elevation: 8,
            },
          ]}>
          {hasImage ? (
            <Image
              source={{ uri: displayImageUrl! }}
              style={styles.thumbnail}
              contentFit="cover"
            />
          ) : (
            <View
              style={[
                styles.thumbnail,
                styles.thumbnailPlaceholder,
                { backgroundColor: dark ? '#1F1F1F' : '#F5F5F5' },
              ]}>
              <ImageIcon size={22} color={dark ? '#4B5563' : '#C9C9C9'} />
            </View>
          )}

          <View style={styles.content}>
            <View style={styles.topRow}>
              <Text
                style={[styles.title, { color: colors.textColors.default }]}
                numberOfLines={2}>
                {item.title}
              </Text>

              <View style={styles.topRight}>
                <View
                  style={[
                    styles.typeBadge,
                    { borderColor: dark ? '#2D2D2D' : '#ECECEC' },
                  ]}>
                  <Text style={styles.typeBadgeEmoji}>{config.emoji}</Text>
                  <Text
                    style={[
                      styles.typeBadgeLabel,
                      { color: colors.textColors.subtle },
                    ]}>
                    {config.label}
                  </Text>
                </View>

                {isMember ? (
                  isReordering ? (
                    <View style={styles.reorderButtons}>
                      <Pressable
                        onPress={onMoveUp}
                        disabled={!canMoveUp}
                        hitSlop={6}
                        style={[
                          styles.arrowBtn,
                          !canMoveUp && styles.arrowDisabled,
                        ]}>
                        <ChevronUp
                          size={16}
                          strokeWidth={1.75}
                          color={
                            canMoveUp
                              ? dark
                                ? '#ADB5BD'
                                : '#1A1A1A'
                              : dark
                                ? '#4B5563'
                                : '#D0D0D0'
                          }
                        />
                      </Pressable>
                      <Pressable
                        onPress={onMoveDown}
                        disabled={!canMoveDown}
                        hitSlop={6}
                        style={[
                          styles.arrowBtn,
                          !canMoveDown && styles.arrowDisabled,
                        ]}>
                        <ChevronDown
                          size={16}
                          strokeWidth={1.75}
                          color={
                            canMoveDown
                              ? dark
                                ? '#ADB5BD'
                                : '#1A1A1A'
                              : dark
                                ? '#4B5563'
                                : '#D0D0D0'
                          }
                        />
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      hitSlop={10}
                      onPress={handleOptionsPress}
                      style={styles.menuBtn}>
                      <Ellipsis
                        size={16}
                        strokeWidth={1.5}
                        color={colors.textColors.subtle}
                      />
                    </Pressable>
                  )
                ) : null}
              </View>
            </View>

            {item.locationName ? (
              <Text
                style={[
                  styles.locationText,
                  { color: colors.textColors.subtle },
                ]}
                numberOfLines={1}>
                {item.locationName}
              </Text>
            ) : null}

            <View style={styles.spacer} />

            {hasMapTarget ? (
              <View style={styles.bottomRow}>
                <Pressable
                  onPress={handleOpenInMaps}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.mapsLink,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}>
                  <Text
                    style={[
                      styles.mapsLinkText,
                      { color: colors.textColors.subtle },
                    ]}>
                    Open in Maps
                  </Text>
                  <ArrowUpRight
                    size={12}
                    strokeWidth={1.75}
                    color={colors.textColors.subtle}
                  />
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>

      <ActionMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        options={menuOptions}
        anchorPosition={menuAnchor}
      />
    </View>
  );

  return (
    <View>
      {drag ? <ScaleDecorator>{cardInner}</ScaleDecorator> : cardInner}

      <Modal
        visible={notesModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotesModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setNotesModalVisible(false)}
          />
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: dark ? '#1C1C1E' : '#fff' },
            ]}>
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: colors.textColors.default },
                ]}>
                Notes
              </Text>
              <TouchableOpacity onPress={() => setNotesModalVisible(false)}>
                <Text
                  style={[
                    styles.modalCancel,
                    { color: colors.textColors.subtle },
                  ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={notesText}
              onChangeText={setNotesText}
              multiline
              placeholder="Add notes, links, reminders…"
              placeholderTextColor={dark ? '#6B7280' : '#9CA3AF'}
              style={[
                styles.notesInput,
                {
                  color: colors.textColors.default,
                  backgroundColor: dark ? '#2C2C2E' : '#F9FAFB',
                  borderColor: dark ? '#374151' : '#E5E7EB',
                },
              ]}
              autoFocus
            />
            <TouchableOpacity onPress={handleSaveNotes} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default ItineraryItemCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 112,
    zIndex: 1,
  },
  thumbnail: {
    width: 104,
    alignSelf: 'stretch',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    flexShrink: 0,
  },
  thumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 99,
  },
  typeBadgeEmoji: {
    fontSize: 11,
  },
  typeBadgeLabel: {
    fontSize: 10,
    fontFamily: AppFonts.inter.medium,
    letterSpacing: 0.2,
  },
  title: {
    flex: 1,
    fontSize: 15,
    lineHeight: 19,
    fontFamily: AppFonts.bricolage.semiBold,
    letterSpacing: -0.1,
  },
  locationText: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: AppFonts.inter.regular,
    lineHeight: 16,
  },
  spacer: {
    flex: 1,
    minHeight: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  mapsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  mapsLinkText: {
    fontSize: 11,
    fontFamily: AppFonts.inter.medium,
    letterSpacing: 0.1,
  },
  menuBtn: {
    padding: 2,
  },
  reorderButtons: {
    flexDirection: 'column',
    gap: 2,
  },
  arrowBtn: {
    padding: 2,
  },
  arrowDisabled: {
    opacity: 0.3,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: AppFonts.bricolage.semiBold,
  },
  modalCancel: {
    fontSize: 15,
    fontFamily: AppFonts.inter.regular,
  },
  notesInput: {
    minHeight: 120,
    maxHeight: 240,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: AppFonts.inter.regular,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#FF1F8C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: AppFonts.inter.medium,
  },
});
