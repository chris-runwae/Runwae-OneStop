import AddToTripContent from "@/components/home/AddToTripContent";
import CustomModal from "@/components/ui/CustomModal";
import { useTrips } from "@/context/TripsContext";
import { savedItemFromDiscoveryItem } from "@/utils/savedIdeaInputs";
import type { DiscoverItem } from "@/constants/discoverCategories";
import { useTheme } from "@react-navigation/native";
import { Heart, MapPin, Plus } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  const { dark } = useTheme();
  const { addIdeaToTrip } = useTrips();
  const [addOpen, setAddOpen] = useState(false);

  const saved = saveControls?.isSaved(item.provider, item.apiRef) ?? false;

  const priceLabel = useMemo(() => {
    if (item.price === undefined || item.price === null) return null;
    try {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: item.currency ?? "USD",
        maximumFractionDigits: 0,
      }).format(item.price);
    } catch {
      return `${item.currency ?? ""} ${Math.round(item.price)}`.trim();
    }
  }, [item.price, item.currency]);

  const handleAdd = async (tripId: string) => {
    try {
      await addIdeaToTrip(tripId, savedItemFromDiscoveryItem(item));
      setAddOpen(false);
      Alert.alert("Saved", "Added to your trip ideas.");
    } catch (e) {
      Alert.alert(
        "Could not save",
        e instanceof Error ? e.message : "Please try again.",
      );
    }
  };

  return (
    <>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${categoryLabel}`}
        className="overflow-hidden rounded-2xl bg-white dark:bg-dark-seconndary"
        style={{ flex: 1 }}>
        <View className="relative aspect-[4/3] w-full bg-gray-100 dark:bg-zinc-800">
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : null}
          <View className="absolute left-2 top-2 flex-row items-center gap-1 rounded-full bg-black/60 px-2 py-1">
            {categoryEmoji ? (
              <Text className="text-[10px]">{categoryEmoji}</Text>
            ) : null}
            <Text className="text-[10px] font-medium text-white">
              {categoryLabel}
            </Text>
          </View>
          {saveControls ? (
            <TouchableOpacity
              hitSlop={8}
              onPress={() => saveControls.toggle(item)}
              className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-black/40">
              <Heart
                size={16}
                color={saved ? "#FF1F8C" : "#ffffff"}
                fill={saved ? "#FF1F8C" : "transparent"}
                strokeWidth={2.2}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <View className="p-3">
          <Text
            numberOfLines={1}
            className="text-[14px] font-bold text-foreground dark:text-white"
            style={{ fontFamily: "BricolageGrotesque-Bold" }}>
            {item.title}
          </Text>
          {item.description ? (
            <Text
              numberOfLines={2}
              className="mt-1 text-[12px] leading-tight text-gray-500 dark:text-gray-400">
              {item.description}
            </Text>
          ) : null}

          {item.locationName ? (
            <View className="mt-1.5 flex-row items-center gap-1">
              <MapPin
                size={11}
                color={dark ? "#9CA3AF" : "#6B7280"}
                strokeWidth={2}
              />
              <Text
                numberOfLines={1}
                className="text-[11px] text-gray-500 dark:text-gray-400">
                {item.locationName}
              </Text>
            </View>
          ) : null}

          <View className="mt-3 flex-row items-center justify-between gap-2">
            <Text
              numberOfLines={1}
              className="flex-1 text-[12.5px] font-semibold text-foreground dark:text-white">
              {priceLabel ? `From ${priceLabel}` : ""}
            </Text>
            <TouchableOpacity
              onPress={() => setAddOpen(true)}
              hitSlop={6}
              className="h-8 flex-row items-center justify-center gap-1 rounded-full bg-primary px-2.5"
              accessibilityLabel={`Add ${item.title} to a trip`}>
              <Plus size={12} color="#fff" strokeWidth={2.5} />
              <Text className="text-[11px] font-semibold text-white">Add</Text>
            </TouchableOpacity>
          </View>
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
