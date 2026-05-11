import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useMemo } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import type { DiscoveryItem } from './types';

// Discriminated input: either a sanitized DB events doc (with `name`/`slug`/
// `startDateUtc`) or an external DiscoveryItem with `category === "event"`.
export type EventCardInput =
  | {
      kind: 'db';
      id: string;
      slug: string;
      name: string;
      imageUrl?: string;
      category?: string;
      startDateUtc?: number;
      timezone?: string;
      locationName?: string;
    }
  | { kind: 'external'; item: DiscoveryItem };

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80';

const getCategoryEmoji = (category: string | undefined) => {
  const cat = category?.toLowerCase() ?? '';
  if (cat.includes('food') || cat.includes('culinary')) return '🍽️';
  if (cat.includes('music') || cat.includes('culture') || cat.includes('fest'))
    return '🎶';
  if (
    cat.includes('art') ||
    cat.includes('exhibition') ||
    cat.includes('cultural')
  )
    return '🌈';
  if (cat.includes('adventure') || cat.includes('outdoor')) return '🏜️';
  if (cat.includes('water') || cat.includes('boat') || cat.includes('cruise'))
    return '⛵';
  if (cat.includes('sport')) return '🏉';
  return '✨';
};

const formatDate = (epochMs: number, timezone?: string) => {
  try {
    return new Date(epochMs).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: timezone,
    });
  } catch {
    return new Date(epochMs).toLocaleDateString();
  }
};

interface DiscoverEventCardProps {
  input: EventCardInput;
  index?: number;
  fullWidth?: boolean;
}

const DiscoverEventCard: React.FC<DiscoverEventCardProps> = ({
  input,
  index = 0,
  fullWidth = false,
}) => {
  const isNavigating = React.useRef(false);

  const meta =
    input.kind === 'db'
      ? {
          title: input.name,
          image: input.imageUrl,
          category: input.category,
          dateLabel: input.startDateUtc
            ? formatDate(input.startDateUtc, input.timezone)
            : undefined,
          location: input.locationName,
        }
      : {
          title: input.item.title,
          image: input.item.imageUrl,
          category: input.item.category,
          dateLabel: undefined,
          location: input.item.locationName,
        };

  const handlePress = async () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    try {
      if (input.kind === 'db') {
        // DB events don't have an external URL; use the in-app deep link.
        router.push({
          pathname: '/events/[slug]' as any,
          params: { slug: input.slug },
        });
        return;
      }
      const url = input.item.externalUrl;
      if (!url) return;
      await WebBrowser.openBrowserAsync(url);
    } finally {
      setTimeout(() => {
        isNavigating.current = false;
      }, 600);
    }
  };

  const rotation = index % 2 === 0 ? '-1.5deg' : '1.5deg';
  const emoji = getCategoryEmoji(meta.category);
  const imageSource = useMemo(
    () => ({ uri: meta.image || FALLBACK_IMAGE }),
    [meta.image],
  );

  return (
    <Pressable
      onPress={handlePress}
      className={fullWidth ? '' : 'mr-3'}
      style={{
        flex: fullWidth ? 1 : undefined,
        width: fullWidth ? '100%' : 160,
      }}>
      <View className="relative w-full">
        <View
          className={`overflow-hidden rounded-[15px] bg-white dark:bg-dark-seconndary ${
            fullWidth
              ? 'ml-[2%] aspect-[4/4.5] w-[96%]'
              : 'h-[145px] w-[128px]'
          }`}
          style={[
            { transform: [{ rotate: rotation }] },
            Platform.OS === 'ios'
              ? {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.5,
                  shadowRadius: 8,
                }
              : { elevation: 3 },
          ]}>
          <Image
            source={imageSource}
            className="h-full w-full rounded-[15px] border-[4px] border-white dark:border-dark-seconndary"
            contentFit="cover"
            cachePolicy="memory-disk"
            priority="high"
            transition={180}
          />
        </View>

        <View
          className="absolute right-[15px] top-[40%]"
          style={
            Platform.OS === 'ios'
              ? {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                }
              : { elevation: 2 }
          }>
          <Text className="text-4xl">{emoji}</Text>
        </View>
      </View>

      <View className="mb-1 mt-2 flex-row items-center gap-x-1">
        <Text
          className="flex-1 text-[14px] font-bold text-black dark:text-white"
          style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}
          numberOfLines={2}>
          {meta.title}
        </Text>
      </View>

      <View className="flex-row items-center">
        {meta.dateLabel ? (
          <Text className="border-r border-gray-300 pr-1.5 text-xs text-gray-500 dark:border-gray-600 dark:text-gray-400">
            {meta.dateLabel}
          </Text>
        ) : null}
        {meta.location ? (
          <Text
            className="flex-1 pl-1.5 text-xs text-gray-500 dark:text-gray-400"
            numberOfLines={1}>
            {meta.location.split(',')[0]}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
};

export default DiscoverEventCard;
