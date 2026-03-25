import React from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
  ActionSheetIOS,
} from 'react-native';
import {
  Calendar,
  Car,
  Compass,
  GripVertical,
  Hotel,
  MoreVertical,
  Plane,
  Ship,
  Utensils,
} from 'lucide-react-native';

import { Text } from '@/components';
import { Colors, textStyles } from '@/constants';
import { ItineraryItem, ItemType } from '@/hooks/useItineraryActions';

// ----------------------------------------------------------------
// Type icon map
// ----------------------------------------------------------------

const TYPE_ICONS: Record<ItemType, (color: string) => React.ReactNode> = {
  flight:     (c) => <Plane     size={16} color={c} />,
  hotel:      (c) => <Hotel     size={16} color={c} />,
  activity:   (c) => <Compass   size={16} color={c} />,
  restaurant: (c) => <Utensils  size={16} color={c} />,
  transport:  (c) => <Car       size={16} color={c} />,
  cruise:     (c) => <Ship      size={16} color={c} />,
  event:      (c) => <Calendar  size={16} color={c} />,
  other:      (c) => <MoreVertical size={16} color={c} />,
};

const TYPE_COLORS: Record<ItemType, string> = {
  flight:     '#3b82f6',
  hotel:      '#8b5cf6',
  activity:   '#f59e0b',
  restaurant: '#ef4444',
  transport:  '#6b7280',
  cruise:     '#06b6d4',
  event:      '#ec4899',
  other:      '#9ca3af',
};

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

function formatTime(time: string | null): string | null {
  if (!time) return null;
  // time is stored as HH:MM:SS — trim seconds
  return time.slice(0, 5);
}

function formatCost(cost: number | null, currency: string): string | null {
  if (cost == null) return null;
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(cost);
  } catch {
    return `${currency} ${cost}`;
  }
}

// ----------------------------------------------------------------
// Component
// ----------------------------------------------------------------

type Props = {
  item: ItineraryItem;
  isReordering: boolean;
  isCreator: boolean;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
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
  canMoveUp,
  canMoveDown,
}: Props) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const typeColor = TYPE_COLORS[item.type] ?? '#9ca3af';
  const icon = TYPE_ICONS[item.type]?.(typeColor) ?? null;

  const start = formatTime(item.start_time);
  const end   = formatTime(item.end_time);
  const timeRange = start
    ? end
      ? `${start} – ${end}`
      : start
    : null;

  const cost = formatCost(item.cost, item.currency);

  const handleOptions = () => {
    if (!isCreator) return;
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Delete item'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (i) => {
          if (i === 1) onDelete();
        },
      );
    } else {
      Alert.alert('Item options', undefined, [
        { text: 'Delete item', style: 'destructive', onPress: onDelete },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundColors.subtle,
          borderColor: isReordering
            ? typeColor + '40'
            : colors.borderColors.subtle,
          borderWidth: isReordering ? 1.5 : 1,
        },
      ]}>
      {/* Left: type dot */}
      <View style={[styles.typeDot, { backgroundColor: typeColor + '20' }]}>
        {icon}
      </View>

      {/* Centre: content */}
      <View style={styles.content}>
        <Text
          style={[styles.title, { color: colors.textColors.default }]}
          numberOfLines={1}>
          {item.title}
        </Text>

        {(item.location || timeRange) && (
          <View style={styles.meta}>
            {timeRange ? (
              <Text style={[styles.metaText, { color: typeColor }]}>
                {timeRange}
              </Text>
            ) : null}
            {item.location ? (
              <Text
                style={[styles.metaText, { color: colors.textColors.subtle }]}
                numberOfLines={1}>
                {item.location}
              </Text>
            ) : null}
          </View>
        )}
      </View>

      {/* Right: cost + actions */}
      <View style={styles.right}>
        {cost ? (
          <Text style={[styles.cost, { color: colors.textColors.default }]}>
            {cost}
          </Text>
        ) : null}

        {isReordering ? (
          <View style={styles.reorderButtons}>
            <Pressable
              onPress={onMoveUp}
              disabled={!canMoveUp}
              hitSlop={8}
              style={[styles.arrowBtn, !canMoveUp && styles.arrowDisabled]}>
              <Text
                style={{
                  fontSize: 12,
                  color: canMoveUp ? typeColor : colors.textColors.subtle,
                }}>
                ↑
              </Text>
            </Pressable>
            <Pressable
              onPress={onMoveDown}
              disabled={!canMoveDown}
              hitSlop={8}
              style={[styles.arrowBtn, !canMoveDown && styles.arrowDisabled]}>
              <Text
                style={{
                  fontSize: 12,
                  color: canMoveDown ? typeColor : colors.textColors.subtle,
                }}>
                ↓
              </Text>
            </Pressable>
          </View>
        ) : (
          <GripVertical
            size={16}
            color={colors.textColors.subtle}
            style={{ opacity: 0.5 }}
          />
        )}

        {isCreator && !isReordering && (
          <Pressable
            onPress={handleOptions}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MoreVertical size={16} color={colors.textColors.subtle} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default ItineraryItemCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    gap: 10,
    marginBottom: 6,
  },
  typeDot: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontFamily: 'BricolageGrotesque-SemiBold',
  },
  meta: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 12,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  cost: {
    fontSize: 13,
    fontFamily: 'BricolageGrotesque-SemiBold',
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
});
