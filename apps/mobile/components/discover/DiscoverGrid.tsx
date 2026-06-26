import {
  DISCOVER_CATEGORIES,
  DISCOVER_SAMPLES,
  CHIP_QUERY,
  defaultSearchDates,
  type DiscoverItem,
} from "@/constants/discoverCategories";
import SkeletonBox from "@/components/ui/SkeletonBox";
import DiscoverCard, {
  type SaveControls,
} from "@/components/discover/DiscoverCard";
import { api } from "@runwae/convex/convex/_generated/api";
import { useTheme } from "expo-router/react-navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  openBrowserAsync,
  WebBrowserPresentationStyle,
} from "expo-web-browser";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GUTTER = 12;
const SIDE_PADDING = 20;
const CARD_WIDTH = (SCREEN_WIDTH - SIDE_PADDING * 2 - GUTTER) / 2;

type Props = {
  /** Source city for the search term. Use viewer.homeCity on Home, trip
   *  destinationLabel on trip-detail Discover, destination.title on the
   *  destination-detail screen. */
  city: string;
  coords?: { lat: number; lng: number };
  originIata?: string | null;
  destinationIata?: string | null;
  checkin?: string;
  checkout?: string;
  initialCategory?: string;
  excludeCategories?: readonly string[];
  showHeading?: boolean;
  heading?: string;
};

export default function DiscoverGrid({
  city,
  coords,
  originIata,
  destinationIata,
  checkin,
  checkout,
  initialCategory = "all",
  excludeCategories,
  showHeading = true,
  heading = "Discover",
}: Props) {
  const { dark } = useTheme();
  const search = useAction(api.discovery.searchByCategory);
  const savedKeys = useQuery(api.user_saves.listKeys, {});
  const addSave = useMutation(api.user_saves.add);
  const removeSave = useMutation(api.user_saves.remove);

  const [active, setActive] = useState<string>(initialCategory);
  const [results, setResults] = useState<DiscoverItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const visibleCategories = useMemo(
    () =>
      excludeCategories
        ? DISCOVER_CATEGORIES.filter((c) => !excludeCategories.includes(c.k))
        : DISCOVER_CATEGORIES,
    [excludeCategories],
  );

  const savedSet = useMemo(() => {
    const s = new Set<string>();
    for (const k of savedKeys ?? []) s.add(`${k.provider}:${k.apiRef}`);
    return s;
  }, [savedKeys]);

  const saveControls: SaveControls = useMemo(
    () => ({
      isSaved: (provider, apiRef) => savedSet.has(`${provider}:${apiRef}`),
      toggle: async (item) => {
        const key = `${item.provider}:${item.apiRef}`;
        if (savedSet.has(key)) {
          await removeSave({ provider: item.provider, apiRef: item.apiRef });
        } else {
          await addSave({
            provider: item.provider,
            apiRef: item.apiRef,
            // Backend CATEGORY validator accepts hotel/flight/tour/activity/
            // restaurant/event/destination/trip/other — map keys accordingly.
            category: mapToSaveCategory(item.category),
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl,
            price: item.price,
            currency: item.currency,
            locationName: item.locationName,
            coords: item.coords,
            externalUrl: item.externalUrl,
          });
        }
      },
    }),
    [savedSet, addSave, removeSave],
  );

  useEffect(() => {
    if (active === "all") {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    const cfg = CHIP_QUERY[active];
    if (!cfg) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    const term = cfg.termSuffix ? `${city}${cfg.termSuffix}` : city;
    const fallback = defaultSearchDates();
    const args: Record<string, unknown> = {
      category: cfg.providerCategory,
      term,
      limit: 6,
      checkin: checkin ?? fallback.checkin,
      checkout: checkout ?? fallback.checkout,
      forceRefresh: refreshTick > 0,
    };
    if (coords?.lat !== undefined) args.lat = coords.lat;
    if (coords?.lng !== undefined) args.lng = coords.lng;

    if (cfg.providerCategory === "fly") {
      if (!originIata) {
        setLoading(false);
        setResults([]);
        setError("Set your home airport in Profile to see flight deals.");
        return;
      }
      args.originIata = originIata;
      if (destinationIata) args.destinationIata = destinationIata;
    }

    (search(args as Parameters<typeof search>[0]) as Promise<DiscoverItem[]>)
      .then((items) => {
        if (cancelled) return;
        setResults(items ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        setResults([]);
        setError(err instanceof Error ? err.message : "Search failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    active,
    city,
    coords?.lat,
    coords?.lng,
    originIata,
    destinationIata,
    checkin,
    checkout,
    refreshTick,
    search,
  ]);

  const handleCardPress = useCallback((item: DiscoverItem) => {
    if (item.provider === "viator") {
      if (item.externalUrl) {
        openBrowserAsync(item.externalUrl, {
          presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
        }).catch(() => {});
        return;
      }
      router.push({
        pathname: "/viator/[productCode]",
        params: { productCode: item.apiRef },
      });
      return;
    }
    if (item.provider === "liteapi") {
      const fallback = defaultSearchDates();
      router.push({
        pathname: "/hotel/[hotelId]",
        params: {
          hotelId: item.apiRef,
          checkin: checkin ?? fallback.checkin,
          checkout: checkout ?? fallback.checkout,
          adults: "2",
        },
      });
      return;
    }
    if (item.externalUrl) {
      Linking.openURL(item.externalUrl).catch(() => {});
    }
  }, [checkin, checkout]);

  const renderHeader = showHeading ? (
    <View className="mb-3 flex-row items-center justify-between" style={{ paddingHorizontal: SIDE_PADDING }}>
      <Text
        className="text-lg font-bold text-foreground dark:text-white"
        style={{ fontFamily: "BricolageGrotesque-Bold" }}>
        {heading}
      </Text>
      {active !== "all" ? (
        <TouchableOpacity
          onPress={() => setRefreshTick((n) => n + 1)}
          hitSlop={8}
          accessibilityLabel="Refresh results">
          <Text className="text-[12px] font-semibold text-primary">
            Refresh
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  ) : null;

  return (
    <View>
      {renderHeader}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: SIDE_PADDING,
          paddingBottom: 4,
        }}>
        {visibleCategories.map((c, idx) => {
          const on = active === c.k;
          return (
            <Pressable
              key={c.k}
              onPress={() => setActive(c.k)}
              accessibilityRole="button"
              accessibilityLabel={`${c.label} category`}
              accessibilityState={{ selected: on }}
              className={`mr-2 flex-row items-center rounded-full border px-3.5 py-2 ${
                on
                  ? "border-primary bg-primary"
                  : "border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-dark-seconndary"
              }`}
              style={idx === visibleCategories.length - 1 ? { marginRight: 0 } : undefined}>
              <Text
                className={`text-[12.5px] font-medium ${
                  on ? "text-white" : "text-gray-500 dark:text-gray-300"
                }`}>
                {c.emoji ? `${c.emoji} ` : ""}
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: SIDE_PADDING, paddingTop: 12 }}>
        {error ? (
          <View className="items-center rounded-2xl border border-dashed border-gray-300 px-4 py-6 dark:border-white/15">
            <Text className="text-center text-[12.5px] text-gray-500 dark:text-gray-400">
              {error}
            </Text>
            <TouchableOpacity
              onPress={() => setRefreshTick((n) => n + 1)}
              className="mt-3 rounded-full bg-primary px-4 py-2">
              <Text className="text-[12px] font-semibold text-white">
                Try again
              </Text>
            </TouchableOpacity>
          </View>
        ) : active === "all" ? (
          <Grid items={DISCOVER_SAMPLES.map(toDiscoverFromSample)} onCardPress={handleCardPress} saveControls={saveControls} />
        ) : loading ? (
          <SkeletonGrid />
        ) : results.length === 0 ? (
          <View className="items-center rounded-2xl border border-dashed border-gray-300 px-4 py-6 dark:border-white/15">
            <Text className="text-center text-[12.5px] text-gray-500 dark:text-gray-400">
              No results for{" "}
              {DISCOVER_CATEGORIES.find((c) => c.k === active)?.label} near {city}.
            </Text>
            <TouchableOpacity
              onPress={() => setRefreshTick((n) => n + 1)}
              className="mt-3 rounded-full bg-primary px-4 py-2">
              <Text className="text-[12px] font-semibold text-white">
                Try again
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Grid
            items={results}
            onCardPress={handleCardPress}
            saveControls={saveControls}
          />
        )}
      </View>
    </View>
  );
}

function toDiscoverFromSample(
  d: (typeof DISCOVER_SAMPLES)[number],
): DiscoverItem {
  return {
    provider: "static",
    apiRef: d.id,
    category: d.cat,
    title: d.title,
    description: d.desc,
    imageUrl: d.img,
    locationName: d.loc,
  };
}

function mapToSaveCategory(
  category: string,
):
  | "hotel"
  | "flight"
  | "tour"
  | "activity"
  | "restaurant"
  | "event"
  | "destination"
  | "trip"
  | "other" {
  switch (category) {
    case "stay":
    case "hotel":
      return "hotel";
    case "fly":
    case "flight":
      return "flight";
    case "tour":
    case "explore":
      return "tour";
    case "do":
    case "adventure":
    case "activity":
    case "adv":
    case "relax":
      return "activity";
    case "eat":
    case "restaurant":
      return "restaurant";
    case "attend":
    case "event":
      return "event";
    case "destination":
      return "destination";
    case "trip":
      return "trip";
    default:
      return "other";
  }
}

function Grid({
  items,
  onCardPress,
  saveControls,
}: {
  items: DiscoverItem[];
  onCardPress: (item: DiscoverItem) => void;
  saveControls: SaveControls;
}) {
  // Pair rows manually so we don't pay for FlashList here — Discover renders
  // inside the home ScrollView and a nested virtualised list breaks the
  // outer scroll. Up to 6 cards on non-"all" tabs keeps this cheap.
  const rows: DiscoverItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return (
    <View>
      {rows.map((row, rowIdx) => (
        <View
          key={rowIdx}
          className="flex-row"
          style={{
            gap: GUTTER,
            marginBottom: rowIdx === rows.length - 1 ? 0 : GUTTER,
          }}>
          {row.map((item) => (
            <View
              key={`${item.provider}:${item.apiRef}`}
              style={{ width: CARD_WIDTH }}>
              <DiscoverCard
                item={item}
                categoryLabel={
                  DISCOVER_CATEGORIES.find((c) => c.k === item.category)
                    ?.label ?? item.category
                }
                categoryEmoji={
                  DISCOVER_CATEGORIES.find((c) => c.k === item.category)?.emoji
                }
                onPress={() => onCardPress(item)}
                saveControls={saveControls}
              />
            </View>
          ))}
          {row.length === 1 ? (
            <View style={{ width: CARD_WIDTH }} />
          ) : null}
        </View>
      ))}
    </View>
  );
}

function SkeletonGrid() {
  return (
    <View>
      <View className="flex-row" style={{ gap: GUTTER, marginBottom: GUTTER }}>
        <SkeletonBox width={CARD_WIDTH} height={CARD_WIDTH * 1.25} borderRadius={16} />
        <SkeletonBox width={CARD_WIDTH} height={CARD_WIDTH * 1.25} borderRadius={16} />
      </View>
      <View className="flex-row" style={{ gap: GUTTER }}>
        <SkeletonBox width={CARD_WIDTH} height={CARD_WIDTH * 1.25} borderRadius={16} />
        <SkeletonBox width={CARD_WIDTH} height={CARD_WIDTH * 1.25} borderRadius={16} />
      </View>
    </View>
  );
}
