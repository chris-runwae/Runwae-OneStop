import LocationMap from '@/components/event/LocationMap';
import { MapPin, Navigation } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { SectionTitle } from './EventDetailPrimitives';

interface EventLocationSectionProps {
  location: string;
  title: string;
  latitude?: number;
  longitude?: number;
  onOpenMap: () => void;
  onDirections: () => void;
}

const EventLocationSection = ({
  location,
  title,
  latitude,
  longitude,
  onOpenMap,
  onDirections,
}: EventLocationSectionProps) => (
  <View className="px-5 py-6">
    <SectionTitle title="Location" />
    <Pressable
      onPress={onOpenMap}
      className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
      <View pointerEvents="none">
        <LocationMap
          location={location}
          eventTitle={title}
          latitude={latitude}
          longitude={longitude}
          style={{ width: '100%', height: 200 }}
        />
      </View>
      <View className="flex-row items-center justify-between bg-white px-4 py-3 dark:bg-dark-seconndary">
        <View className="flex-1 flex-row items-center gap-x-2">
          <MapPin size={15} color="#FF2E92" />
          <Text
            className="flex-1 text-sm text-gray-700 dark:text-gray-300"
            numberOfLines={1}>
            {location}
          </Text>
        </View>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onDirections();
          }}
          className="flex-row items-center gap-x-1.5 rounded-full bg-primary/10 px-3 py-1.5">
          <Navigation size={12} color="#FF2E92" />
          <Text className="text-xs font-semibold text-primary">Directions</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  </View>
);

export default EventLocationSection;
