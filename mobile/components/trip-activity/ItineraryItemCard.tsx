import { Image } from 'expo-image';
import {
  ChevronDown,
  ChevronUp,
  Ellipsis,
  ImageIcon,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';

import { Text } from '@/components';
import ActionMenu, { ActionOption } from '@/components/common/ActionMenu';
import { AppFonts, Colors } from '@/constants';
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
}: Props) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ top: 0, right: 0 });

  const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.other;
  const hasImage = !!item.image_url;

  const handleOptionsPress = (event: any) => {
    if (!isCreator) return;
    const { pageY } = event.nativeEvent;
    setMenuAnchor({ top: pageY + 10, right: 24 });
    setMenuVisible(true);
  };

  const menuOptions: ActionOption[] = [
    { label: 'View notes', onPress: () => {} },
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
      <View
        style={[
          styles.card,
          {
            borderColor: '#F0F0F0',
          },
        ]}>
        {hasImage ? (
          <Image
            source={{ uri: item.image_url! }}
            style={styles.thumbnail}
            contentFit="cover"
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <ImageIcon size={20} color="#D0D0D0" />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeEmoji}>{config.emoji}</Text>
            <Text style={styles.typeBadgeLabel}>{config.label}</Text>
          </View>

          <Text
            style={[styles.title, { color: colors.textColors.default }]}
            numberOfLines={1}>
            {item.title}
          </Text>

          {item.location ? (
            <Text
              style={[styles.locationText, { color: '#AEAEAE' }]}
              numberOfLines={1}>
              {item.location}
            </Text>
          ) : null}
        </View>

        <View style={styles.right}>
          {isReordering ? (
            <View style={styles.reorderButtons}>
              <Pressable
                onPress={onMoveUp}
                disabled={!canMoveUp}
                style={[styles.arrowBtn, !canMoveUp && styles.arrowDisabled]}>
                <ChevronUp size={20} color={canMoveUp ? '#000' : '#D0D0D0'} />
              </Pressable>
              <Pressable
                onPress={onMoveDown}
                disabled={!canMoveDown}
                style={[styles.arrowBtn, !canMoveDown && styles.arrowDisabled]}>
                <ChevronDown
                  size={18}
                  strokeWidth={1.5}
                  color={canMoveDown ? '#000' : '#D0D0D0'}
                />
              </Pressable>
            </View>
          ) : (
            <Pressable hitSlop={12} onPress={handleOptionsPress}>
              <Ellipsis size={18} strokeWidth={1.5} color="#AEAEAE" />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.notesContainer}>
        <Text
          style={[styles.notesText, !item.notes && styles.notesPlaceholder]}>
          {item.notes || 'Add notes, links, etc here.'}
        </Text>
      </View>

      <ActionMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        options={menuOptions}
        anchorPosition={menuAnchor}
      />
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F5F5F5',
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
    borderColor: '#E9ECEF',
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
    color: '#00',
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
    backgroundColor: '#F9F9F9',
    marginTop: 5,
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  notesText: {
    fontSize: 13,
    fontFamily: AppFonts.inter.regular,
    color: '#666',
    lineHeight: 16,
  },
  notesPlaceholder: {
    color: '#BFBFBF',
  },
});
