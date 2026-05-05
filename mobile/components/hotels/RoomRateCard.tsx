import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, ShieldCheck, ShieldOff } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';

import { Text } from '@/components';
import { Colors } from '@/constants';
import { getCurrencySymbol } from '@/utils/currency';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
/** Content area inside padded parent (16 + 16) */
const CARD_INNER_WIDTH = SCREEN_WIDTH - 32;

type RoomRateCardProps = {
  galleryUrls: string[];
  roomName: string;
  boardName: string;
  price: { amount: number; currency: string } | null;
  refundableTag?: string;
  onPress: () => void;
};

export default function RoomRateCard({
  galleryUrls,
  roomName,
  boardName,
  price,
  refundableTag,
  onPress,
}: RoomRateCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [imageIndex, setImageIndex] = useState(0);

  const slides = useMemo(
    () => (galleryUrls.length > 0 ? galleryUrls : ['']),
    [galleryUrls]
  );

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.wrap,
        {
          borderColor: colorScheme === 'dark' ? '#374151' : '#E9ECEF',
          backgroundColor: colors.backgroundColors.default,
        },
      ]}>
      <View style={styles.gallery}>
        <FlatList
          data={slides}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(
              e.nativeEvent.contentOffset.x / CARD_INNER_WIDTH
            );
            setImageIndex(idx);
          }}
          getItemLayout={(_, index) => ({
            length: CARD_INNER_WIDTH,
            offset: CARD_INNER_WIDTH * index,
            index,
          })}
          renderItem={({ item }) =>
            item ? (
              <Image
                source={{ uri: item }}
                style={{ width: CARD_INNER_WIDTH, height: 168 }}
                contentFit="cover"
              />
            ) : (
              <View
                style={{
                  width: CARD_INNER_WIDTH,
                  height: 168,
                  backgroundColor: '#374151',
                }}
              />
            )
          }
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.35)', 'transparent']}
          style={styles.galleryTopGradient}
        />
        {slides.length > 1 && (
          <View style={styles.dots}>
            {slides.slice(0, 8).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i === imageIndex ? '#fff' : 'rgba(255,255,255,0.45)',
                    width: i === imageIndex ? 14 : 5,
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.row}>
          <View style={styles.textCol}>
            <Text style={[styles.roomName, { color: colors.textColors.default }]}>
              {roomName}
            </Text>
            <Text
              style={[styles.boardName, { color: colors.textColors.subtle }]}>
              {boardName}
            </Text>
            <View style={styles.refundRow}>
              {refundableTag === 'RFN' ? (
                <>
                  <ShieldCheck size={12} color="#22C55E" />
                  <Text style={styles.refundOk}>Free cancellation</Text>
                </>
              ) : (
                <>
                  <ShieldOff size={12} color="#EF4444" />
                  <Text style={styles.refundBad}>Non-refundable</Text>
                </>
              )}
            </View>
          </View>
          <View style={styles.priceCol}>
            <Text style={styles.priceText}>
              {price
                ? `${getCurrencySymbol(price.currency)} ${price.amount.toFixed(0)}`
                : '—'}
            </Text>
            <Text
              style={[styles.perNight, { color: colors.textColors.subtle }]}>
              / night
            </Text>
            <View style={styles.selectPill}>
              <Text style={styles.selectText}>View</Text>
              <ChevronRight size={14} color="#fff" />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  gallery: {
    position: 'relative',
    backgroundColor: '#1f2937',
  },
  galleryTopGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
  },
  dots: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  body: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  textCol: { flex: 1, gap: 4 },
  roomName: {
    fontSize: 15,
    fontWeight: '700',
  },
  boardName: {
    fontSize: 12,
  },
  refundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  refundOk: { fontSize: 11, color: '#22C55E' },
  refundBad: { fontSize: 11, color: '#EF4444' },
  priceCol: { alignItems: 'flex-end', gap: 2 },
  priceText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FF1F8C',
  },
  perNight: { fontSize: 11 },
  selectPill: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FF1F8C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  selectText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
