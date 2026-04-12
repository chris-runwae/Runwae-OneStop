import { ADD_ONS_FOR_YOU } from '@/constants/home.constant';
import React, { useMemo, useState } from 'react';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import RecommendationCard from './RecommendationCard';
import { FlashList } from '@shopify/flash-list';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', name: 'All', emoji: '✨' },
  { id: 'Food', name: 'Eat/Drink', emoji: '🍹' },
  { id: 'Stay', name: 'Stay', emoji: '🏨' },
  { id: 'Adventure', name: 'Do', emoji: '🚵' },
  { id: 'Shopping', name: 'Shop', emoji: '🛍️' },
];

const RecommendationsSection = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredRecommendations = useMemo(() => {
    if (activeCategory === 'all') return ADD_ONS_FOR_YOU;
    return ADD_ONS_FOR_YOU.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  return (
    <View className="mt-8">
      <Text
        className="mb-6 text-xl font-bold dark:text-white"
        style={{
          fontFamily: 'BricolageGrotesque-ExtraBold',
          paddingHorizontal: 16,
        }}>
        Recommendations
      </Text>

      <FlashList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        className="mb-8"
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="w-2" />}
        renderItem={({ item: cat }) => (
          <TouchableOpacity
            onPress={() => setActiveCategory(cat.id)}
            className={`flex-row items-center rounded-full border px-4 py-2.5 ${
              activeCategory === cat.id
                ? 'border-primary bg-primary'
                : 'border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-dark-seconndary'
            }`}>
            <Text
              className={`text-sm font-medium ${
                activeCategory === cat.id
                  ? 'text-white'
                  : 'text-gray-500 dark:text-gray-300'
              }`}>
              {cat.id !== 'all' ? `${cat.emoji} ` : ''}
              {cat.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlashList
        data={filteredRecommendations}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecommendationCard item={item} />}
        ListEmptyComponent={
          <View
            className="flex items-center justify-center py-10"
            style={{ width: SCREEN_WIDTH - 40 }}>
            <Image
              source={require('@/assets/images/trip-empty-state.png')}
              className="mb-5 h-[44px] w-[44px]"
              resizeMode="contain"
            />
            <Text
              className="text-lg font-semibold dark:text-white"
              style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
              No recommendations found
            </Text>
            <Text className="mt-1 px-10 text-center text-sm text-gray-400 dark:text-gray-500">
              We couldn&apos;t find any items for this category. Try exploring
              other categories.
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default RecommendationsSection;
