import { EventCardSkeleton } from '@/components/ui/CardSkeletons';
import SectionHeader from '@/components/ui/SectionHeader';
import { Event } from '@/constants/home.constant';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import EventCard from './EventCard';
import { FlashList } from '@shopify/flash-list';

interface UpcomingEventsProps {
  data: Event[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
  showSubtitle?: boolean;
}

const UpcomingEvents = ({
  data,
  title = 'Upcoming Events',
  subtitle = 'Find events that match your vibe',
  loading = false,
  showSubtitle = true,
}: UpcomingEventsProps) => {
  const router = useRouter();
  const displayData = loading ? (Array(5).fill({}) as Event[]) : data;

  return (
    <View>
      <SectionHeader
        title={title}
        subtitle={showSubtitle ? subtitle : undefined}
        onPress={() => router.push('/events' as any)}
      />

      <FlashList
        data={displayData}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          marginTop: 16,
        }}
        keyExtractor={(item, index) =>
          loading ? `skeleton-${index}` : item.id
        }
        renderItem={({ item, index }) =>
          loading ? (
            <EventCardSkeleton index={index} />
          ) : (
            <EventCard event={item} index={index} />
          )
        }
      />
    </View>
  );
};

export default UpcomingEvents;
