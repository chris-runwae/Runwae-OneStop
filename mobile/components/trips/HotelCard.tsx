import { Text } from '@/components';
import { AppFonts, Colors } from '@/constants';
import { useTheme } from '@react-navigation/native';
import { Image } from 'expo-image';
import { MoreHorizontal, Plus } from 'lucide-react-native';
import React, { useRef } from 'react';
import {
  Dimensions,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  View,
} from 'react-native';

import type { LiteAPIHotelRateItem } from '@/types/liteapi.types';
import { getCurrencySymbol } from '@/utils/currency';

interface HotelCardProps {
  imageUri: string;
  categoryLabel?: string;
  title: string;
  description: string;
  onAdd?: () => void;
  onViewDetails?: () => void;
  onOptionsPress?: (position: {
    top: number;
    right?: number;
    left?: number;
  }) => void;
  hotel: LiteAPIHotelRateItem;
  checkin?: string;
  checkout?: string;
  adults?: number;
  tripId?: string;
  style?: StyleProp<ViewStyle>;
}

export default function HotelCard({
  imageUri,
  categoryLabel = '🏨 Stay',
  title,
  description,
  onAdd,
  onViewDetails,
  onOptionsPress,
  hotel,
  style,
}: HotelCardProps) {
  const { dark } = useTheme();
  const colors = Colors[dark ? 'dark' : 'light'];
  const moreBtnRef = useRef<View>(null);

  const getLowestSellingPrice = (
    hotel: LiteAPIHotelRateItem
  ): { amount: number; currency: string } => {
    if (!hotel.roomTypes?.length) return { amount: 0, currency: 'USD' };

    const cheapest = hotel.roomTypes.reduce(
      (min, rt) => {
        const amount = rt.suggestedSellingPrice?.amount ?? Infinity;
        return amount < min.amount
          ? { amount, currency: rt.suggestedSellingPrice?.currency ?? 'USD' }
          : min;
      },
      { amount: Infinity, currency: 'USD' }
    );

    return cheapest.amount === Infinity
      ? { amount: 0, currency: 'USD' }
      : cheapest;
  };

  const { amount, currency } = getLowestSellingPrice(hotel);
  const symbol = getCurrencySymbol(currency);

  return (
    <View style={[styles.card, style]}>
      <View
        style={[
          styles.imageContainer,
          { backgroundColor: colors.backgroundColors.subtle },
        ]}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="cover"
        />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{categoryLabel}</Text>
        </View>
        {onOptionsPress && (
          <TouchableOpacity
            ref={moreBtnRef}
            style={styles.moreButton}
            hitSlop={10}
            onPress={() => {
              if (moreBtnRef.current) {
                moreBtnRef.current.measure(
                  (
                    x: number,
                    y: number,
                    width: number,
                    height: number,
                    pageX: number,
                    pageY: number
                  ) => {
                    const { width: screenWidth } = Dimensions.get('window');
                    onOptionsPress({
                      top: pageY + height, // Place right below the button
                      right: screenWidth - pageX - width, // Align with the button's right edge
                    });
                  }
                );
              } else {
                // Fallback
                onOptionsPress({ top: 100, right: 24 });
              }
            }}>
            <MoreHorizontal size={14} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.content}>
        <Text
          style={[styles.title, { color: colors.textColors.default }]}
          numberOfLines={1}>
          {title}
        </Text>
        <Text
          style={[styles.description, { color: colors.textColors.subtle }]}
          numberOfLines={4}>
          {description}
        </Text>
        {onAdd && (
          <View style={styles.footer}>
            <TouchableOpacity onPress={onViewDetails} hitSlop={10}>
              <Text
                style={[
                  styles.viewDetails,
                  { color: colors.primaryColors.default },
                ]}>
                From {symbol}
                {amount.toFixed(0)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: colors.primaryColors.default },
              ]}
              onPress={onAdd}
              activeOpacity={0.8}>
              <Plus size={12} color="#fff" strokeWidth={3} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    // width: '48.5%',
    // marginBottom: 24,
    flex: 1,
    marginBottom: 24,
    // marginHorizontal: 6, // gap between columns
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.85,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: AppFonts.inter.semiBold,
  },
  moreButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 2,
  },
  title: {
    fontSize: 14,
    fontFamily: AppFonts.bricolage.semiBold,
    marginBottom: 4,
  },
  description: {
    fontSize: 11,
    fontFamily: AppFonts.inter.regular,
    lineHeight: 15,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewDetails: {
    fontSize: 14,
    fontFamily: AppFonts.inter.medium,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
    gap: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: AppFonts.inter.semiBold,
  },
});
