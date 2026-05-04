import CategoryItem from '@/components/ui/CategoryItem';
import { useRouter } from 'expo-router';
import { MoveRight, Search, Sparkles } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  dark: boolean;
};

export default function HomeQuickActions({ dark }: Props) {
  const router = useRouter();

  return (
    <View className="gap-y-6">
      <View className="flex-row justify-between px-2">
        <CategoryItem
          imageSrc={require('@/assets/images/plane.png')}
          label="Flights"
          onPress={() =>
            router.push({ pathname: '/search', params: { tab: 'flights' } })
          }
        />
        <CategoryItem
          imageSrc={require('@/assets/images/house.png')}
          label="Stays"
          onPress={() =>
            router.push({ pathname: '/search', params: { tab: 'stays' } })
          }
        />
        <CategoryItem
          imageSrc={require('@/assets/images/map.png')}
          label="Experiences"
          onPress={() =>
            router.push({
              pathname: '/search',
              params: { tab: 'experiences' },
            })
          }
        />
      </View>

      <View className="h-[1px] w-full bg-gray-100 dark:bg-dark-seconndary" />

      <Pressable
        className="flex-row items-center gap-x-2 px-2"
        onPress={() => router.push('/search')}>
        <View className="flex-row items-center gap-x-1">
          <Sparkles size={12} fill="#ec4899" stroke="#ec4899" />
          <Text className="text-sm font-bold text-pink-500">NEW</Text>
        </View>
        <View className="h-3 w-[1px] bg-gray-300" />
        <Text className="text-sm text-gray-500">Paste a Link</Text>
        <MoveRight size={14} color="#6b7280" className="mx-2" />
        <Text className="text-sm text-gray-500">Generate Itinerary</Text>
      </Pressable>

      <Pressable
        className="h-14 flex-row items-center gap-x-3 rounded-full bg-white px-4 dark:bg-dark-seconndary"
        style={{
          shadowColor: dark ? '#ffffff' : '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        onPress={() => router.push('/search')}>
        <Search size={20} color="#9ca3af" />
        <Text className="flex-1 text-base text-[#9ca3af]">
          Search or paste link
        </Text>
      </Pressable>
    </View>
  );
}
