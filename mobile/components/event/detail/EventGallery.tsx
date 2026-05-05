import React from 'react';
import { FlatList, Image, Text, View } from 'react-native';
import { SectionTitle } from './EventDetailPrimitives';

interface EventGalleryProps {
  images: string[];
}

const EventGallery = ({ images }: EventGalleryProps) => (
  <View className="py-6">
    <View className="mb-4 flex-row items-center justify-between px-5">
      <SectionTitle title="Photos" />
      <Text className="text-xs text-gray-400">{images.length} photos</Text>
    </View>
    <FlatList
      horizontal
      data={images}
      keyExtractor={(item, i) => `${item}-${i}`}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20 }}
      ItemSeparatorComponent={() => <View className="w-3" />}
      renderItem={({ item, index }) => (
        <View className="relative overflow-hidden rounded-2xl">
          <Image
            source={{ uri: item }}
            style={{ width: 220, height: 160 }}
            resizeMode="cover"
          />
          {index === 0 && (
            <View className="absolute bottom-2 left-2 rounded-full bg-black/40 px-2 py-0.5">
              <Text className="text-[10px] text-white">Cover</Text>
            </View>
          )}
        </View>
      )}
    />
  </View>
);

export default EventGallery;
