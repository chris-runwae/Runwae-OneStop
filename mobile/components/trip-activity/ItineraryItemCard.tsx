import { Image } from 'expo-image';
import {
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

import { Text } from '@/components';
import ActionMenu, { ActionOption } from '@/components/common/ActionMenu';
import { AppFonts, COLORS, Colors } from '@/constants';
import { ItemType, ItineraryItem } from '@/hooks/useItineraryActions';

type TypeConfig = {
  label: string;
  emoji: string;
};

const TYPE_CONFIG: Record<ItemType, TypeConfig> = {
  flight: { label: 'Flight', emoji: '✈️' },
  hotel: { label: 'Stay', emoji: '🏨' },
  activity: { label: 'Relax', emoji: '🏝' },
  restaurant: { label: 'Dine', emoji: '🍽' },
  transport: { label: 'Transport', emoji: '🚗' },
  cruise: { label: 'Cruise', emoji: '🚢' },
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
}: Props) => {
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

  const displayImageUrl = item.image_url || null;

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

  return (
    <View>
      <Pressable
        onPress={!isReordering ? onPress : undefined}
        style={({ pressed }) => [
          { opacity: pressed && !isReordering && onPress ? 0.75 : 1 },
        ]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.backgroundColors.default,
              borderColor: dark ? COLORS.gray[750] : '#F0F0F0',
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
                styles.thumbnailPlaceholder,
                { backgroundColor: dark ? '#1F1F1F' : '#F5F5F5' },
              ]}>
              <ImageIcon size={20} color={dark ? '#4B5563' : '#D0D0D0'} />
            </View>
          )}

          <View style={styles.content}>
            <View
              style={[
                styles.typeBadge,
                { borderColor: dark ? '#374151' : '#E9ECEF' },
              ]}>
              <Text style={styles.typeBadgeEmoji}>{config.emoji}</Text>
              <Text
                style={[
                  styles.typeBadgeLabel,
                  { color: colors.textColors.default },
                ]}>
                {config.label}
              </Text>
            </View>

            <Text
              style={[styles.title, { color: colors.textColors.default }]}
              numberOfLines={1}>
              {item.title}
            </Text>

            {item.location ? (
              <Text
                style={[
                  styles.locationText,
                  { color: colors.textColors.subtle },
                ]}
                numberOfLines={1}>
                {item.location}
              </Text>
            ) : null}
          </View>

          <View style={styles.right}>
            {isMember ? (
              isReordering ? (
                <View style={styles.reorderButtons}>
                  <Pressable
                    onPress={onMoveUp}
                    disabled={!canMoveUp}
                    style={[
                      styles.arrowBtn,
                      !canMoveUp && styles.arrowDisabled,
                    ]}>
                    <ChevronUp
                      size={20}
                      color={
                        canMoveUp
                          ? dark
                            ? '#ADB5BD'
                            : '#000'
                          : dark
                            ? '#4B5563'
                            : '#D0D0D0'
                      }
                    />
                  </Pressable>
                  <Pressable
                    onPress={onMoveDown}
                    disabled={!canMoveDown}
                    style={[
                      styles.arrowBtn,
                      !canMoveDown && styles.arrowDisabled,
                    ]}>
                    <ChevronDown
                      size={18}
                      strokeWidth={1.5}
                      color={
                        canMoveDown
                          ? dark
                            ? '#ADB5BD'
                            : '#000'
                          : dark
                            ? '#4B5563'
                            : '#D0D0D0'
                      }
                    />
                  </Pressable>
                </View>
              ) : (
                <Pressable hitSlop={12} onPress={handleOptionsPress}>
                  <Ellipsis
                    size={18}
                    strokeWidth={1.5}
                    color={colors.textColors.subtle}
                  />
                </Pressable>
              )
            ) : null}
          </View>
        </View>
      </Pressable>

      <Pressable
        onPress={openNotesModal}
        style={[
          styles.notesContainer,
          {
            backgroundColor: dark ? '#1A1A1A' : '#F9F9F9',
            borderColor: dark ? '#333' : '#F0F0F0',
          },
        ]}>
        <Text
          style={[
            styles.notesText,
            { color: dark ? '#9BA1A6' : '#666' },
            !item.notes && [
              styles.notesPlaceholder,
              { color: colors.textColors.subtle },
            ],
          ]}>
          {item.notes || 'Add notes, links, etc here.'}
        </Text>
      </Pressable>

      <ActionMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        options={menuOptions}
        anchorPosition={menuAnchor}
      />

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
    alignItems: 'center',
    paddingBottom: 5,
    gap: 12,
    zIndex: 1,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 12,
    flexShrink: 0,
  },
  thumbnailPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    marginBottom: 4,
  },
  typeBadgeEmoji: {
    fontSize: 12,
  },
  typeBadgeLabel: {
    fontSize: 10,
    fontFamily: AppFonts.inter.medium,
  },
  title: {
    fontSize: 14,
    fontFamily: AppFonts.bricolage.semiBold,
  },
  locationText: {
    fontSize: 11,
    fontFamily: AppFonts.inter.regular,
  },
  right: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 24,
  },
  reorderButtons: {
    flexDirection: 'column',
    gap: 4,
  },
  arrowBtn: {
    padding: 2,
  },
  arrowDisabled: {
    opacity: 0.3,
  },
  notesContainer: {
    marginTop: 5,
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  notesText: {
    fontSize: 13,
    fontFamily: AppFonts.inter.regular,
    lineHeight: 16,
  },
  notesPlaceholder: {},
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
