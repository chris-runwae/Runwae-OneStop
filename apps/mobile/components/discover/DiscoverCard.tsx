import { Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { ImageBackground } from 'expo-image';
import { BlurView } from 'expo-blur';

import AddToTripContent from '@/components/home/AddToTripContent';
import CustomModal from '@/components/ui/CustomModal';
import { useTrips } from '@/context/TripsContext';
import { savedItemFromDiscoveryItem } from '@/utils/savedIdeaInputs';
import type { DiscoverItem } from '@/constants/discoverCategories';
import Text from '@/components/ui/Text';
import { AppFonts, Colors } from '@/constants';

type SaveControls = {
  isSaved: (provider: string, apiRef: string) => boolean;
  toggle: (item: DiscoverItem) => Promise<void> | void;
};

interface Props {
  item: DiscoverItem;
  categoryLabel: string;
  categoryEmoji?: string;
  onPress?: () => void;
  saveControls?: SaveControls;
}

export default function DiscoverCard({
  item,
  categoryLabel,
  categoryEmoji,
  onPress,
  saveControls,
}: Props) {
  type ColorScheme = keyof typeof Colors;
  const colorScheme = (useColorScheme() ?? 'light') as ColorScheme;
  const colors = Colors[colorScheme];

  const { addIdeaToTrip } = useTrips();
  const [addOpen, setAddOpen] = useState(false);

  const image =
    item?.imageUrl ??
    'https://images.unsplash.com/photo-1783990901858-59d849c532d6?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  const saved = saveControls?.isSaved(item.provider, item.apiRef) ?? false;

  const priceLabel = useMemo(() => {
    if (item.price === undefined || item.price === null) return null;
    try {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: item.currency ?? 'USD',
        maximumFractionDigits: 0,
      }).format(item.price);
    } catch {
      return `${item.currency ?? ''} ${Math.round(item.price)}`.trim();
    }
  }, [item.price, item.currency]);

  const handleAdd = async (tripId: string) => {
    try {
      await addIdeaToTrip(tripId, savedItemFromDiscoveryItem(item));
      setAddOpen(false);
      Alert.alert('Saved', 'Added to your trip ideas.');
    } catch (e) {
      Alert.alert(
        'Could not save',
        e instanceof Error ? e.message : 'Please try again.'
      );
    }
  };

  return (
    <>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${categoryLabel}`}
        style={styles.container}>
        <View>
          <ImageBackground
            source={{ uri: image }}
            contentFit="cover"
            style={styles.image}>
            <View style={styles.textContainer}>
              <BlurView style={styles.blurView} intensity={70}>
                <Text numberOfLines={3} style={styles.headerText}>
                  {item.title}
                </Text>

                <View style={styles.priceRow}>
                  <Text
                    style={[
                      styles.addText,
                      { color: colors.textColors.subtle },
                    ]}>
                    {priceLabel ? `From ${priceLabel}` : ''}
                  </Text>

                  <TouchableOpacity
                    testID="discover-card-add-button"
                    onPress={() => setAddOpen(true)}
                    hitSlop={6}
                    accessibilityLabel={`Add ${item.title} to a trip`}
                    style={[styles.addButton]}>
                    <BlurView
                      intensity={90}
                      style={[
                        styles.addButton,
                        {
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 99,
                          overflow: 'hidden',
                        },
                      ]}>
                      <Text style={styles.addText}>Add</Text>
                      <Plus
                        size={12}
                        color={colors.textColors.default}
                        strokeWidth={2.5}
                      />
                    </BlurView>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          </ImageBackground>
        </View>
      </Pressable>

      <CustomModal
        isVisible={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add to Trip"
        centeredTitle
        showCloseButton={false}
        showIndicator>
        <AddToTripContent
          onCancel={() => setAddOpen(false)}
          onDone={handleAdd}
        />
      </CustomModal>
    </>
  );
}

export type { SaveControls };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 16,
    paddingBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  addButton: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
    width: 'auto',
  },
  addText: {
    fontSize: 12,
    fontFamily: AppFonts.inter.regular,
  },
  headerText: {
    fontSize: 14,
    lineHeight: 16,
    fontFamily: AppFonts.bricolage.medium,
  },

  image: {
    width: '100%',
    aspectRatio: 0.75,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: 16,
  },
  textContainer: {
    height: '45%',
  },
  blurView: {
    height: '100%',
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
});
