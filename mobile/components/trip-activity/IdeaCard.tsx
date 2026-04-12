import { Text } from '@/components';
import { AppFonts, Colors } from '@/constants';
import { SavedItineraryItem } from '@/hooks/useIdeaActions';
import { useTheme } from '@react-navigation/native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { MoreHorizontal, Plus } from 'lucide-react-native';
import React, { useRef } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

interface IdeaCardProps {
  imageUri: string;
  item?: SavedItineraryItem | null | undefined;
  categoryLabel: string;
  title: string;
  description: string;
  onAdd?: () => void;
  onViewDetails?: () => void;
  onOptionsPress?: (position: {
    top: number;
    right?: number;
    left?: number;
  }) => void;
  checkin?: string | null;
  checkout?: string | null;
  adults?: number | null;
}

export default function IdeaCard({
  imageUri,
  item,
  categoryLabel,
  title,
  description,
  onAdd,
  onViewDetails,
  onOptionsPress,
  checkin,
  checkout,
  adults,
}: IdeaCardProps) {
  const { dark } = useTheme();
  const colors = Colors[dark ? 'dark' : 'light'];
  const moreBtnRef = useRef<View>(null);

  const handleNavigateToDetails = () => {
    if (item?.type === 'hotel') {
      router.push({
        pathname: '/hotels/[hotelId]',
        params: {
          hotelId: item.external_id as string,
          hotelData: JSON.stringify(item.all_data),
          checkin,
          checkout,
          adults,
        },
      } as any);
    }
  };

  return (
    <Pressable style={styles.card} onPress={handleNavigateToDetails}>
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
                View Details
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48.5%',
    marginBottom: 24,
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
    fontSize: 11,
    fontFamily: AppFonts.inter.medium,
    textDecorationLine: 'underline',
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
