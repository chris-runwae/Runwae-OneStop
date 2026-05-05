import { Event } from '@/types/content.types';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Platform, Pressable, Text, View } from 'react-native';

interface EventCardProps {
  event: Event;
  index?: number;
  fullWidth?: boolean;
  inlineEmoji?: boolean;
}

const getCategoryEmoji = (category: string) => {
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

const EventCard = ({
  event,
  index = 0,
  fullWidth = false,
  inlineEmoji = false,
}: EventCardProps) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/events/${event.id}` as any);
  };

  const rotation = index % 2 === 0 ? '-1.5deg' : '1.5deg';
  const emoji = getCategoryEmoji(event.category);
  const title = event.title || 'Untitled Event';

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
          className={`overflow-hidden rounded-[15px] bg-white dark:bg-dark-seconndary ${fullWidth ? 'ml-[2%] aspect-[4/4.5] w-[96%]' : 'h-[145px] w-[128px]'}`}
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
            source={{ uri: event.image }}
            className="h-full w-full rounded-[15px] border-[4px] border-white dark:border-dark-seconndary"
            resizeMode="cover"
          />
        </View>

        {!inlineEmoji && (
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
        )}
      </View>

      <View className={`mb-1 mt-2 flex-row items-center gap-x-1`}>
        <Text
          className={`flex-1 text-[14px] font-bold text-black dark:text-white`}
          style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}
          numberOfLines={2}>
          {title}
        </Text>
        {inlineEmoji && <Text className="text-[14px]">{emoji}</Text>}
      </View>

      <View className="flex-row items-center">
        <Text className="border-r border-gray-300 pr-1.5 text-xs text-gray-500 dark:border-gray-600 dark:text-gray-400">
          {event.date}
        </Text>
        <Text
          className="flex-1 pl-1.5 text-xs text-gray-500 dark:text-gray-400"
          numberOfLines={1}>
          {event.location?.split(',')[0]}
        </Text>
      </View>
    </Pressable>
  );
};

export default EventCard;
