import { useRouter } from 'expo-router';
import { MoveRight, Search, Sparkles } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';

interface HomeTopSectionProps {
  user: any;
  dark?: boolean;
}

const CategoryItem = ({ icon, label }: { icon: string; label: string }) => (
  <Pressable className="flex-1 items-center justify-center gap-y-2">
    <View className="h-14 w-14 items-center justify-center">
      <Text className="text-2xl">{icon}</Text>
    </View>
    <Text className="text-xs font-medium text-gray-400">{label}</Text>
  </Pressable>
);

export default function HomeTopSection({ user, dark }: HomeTopSectionProps) {
  const router = useRouter();
  const firstName = user?.full_name?.split(' ')[0] || 'Aki';

  return (
    <View className="px-5 pb-4 pt-8">
      <Text
        className="mb-8 text-2xl font-bold leading-tight text-black dark:text-white"
        style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
        Let's plan your next{'\n'}adventure, {firstName}. ☀️
      </Text>

      {/* Categories */}
      <View className="mb-8 flex-row justify-between px-2">
        <CategoryItem icon="✈️" label="Flights" />
        <CategoryItem icon="🏠" label="Stays" />
        <CategoryItem icon="🗺️" label="Experiences" />
      </View>

      <View className="mb-6 h-[1px] w-full bg-gray-100 dark:bg-dark-seconndary" />

      <Pressable
        className="mb-4 flex-row items-center gap-x-2 px-2"
        onPress={() => router.push('/trips')}>
        <View className="flex-row items-center gap-x-1">
          <Sparkles size={12} fill="#ec4899" stroke="#ec4899" />
          <Text className="text-sm font-bold text-pink-500">NEW</Text>
        </View>
        <View className="h-3 w-[1px] bg-gray-300" />
        <Text className="text-sm text-gray-500">Paste a Link</Text>
        <MoveRight size={14} color="#6b7280" className="mx-2" />
        <Text className="text-sm text-gray-500">Generate Itinerary</Text>
      </Pressable>

      {/* Search Bar */}
      <View
        className="h-14 flex-row items-center gap-x-3 rounded-full bg-white px-4 dark:bg-dark-seconndary"
        style={
          Platform.OS === 'ios'
            ? {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.03,
                shadowRadius: 3,
              }
            : { elevation: 3 }
        }>
        <Search size={20} color="#9ca3af" />
        <TextInput
          className="flex-1 text-base text-black dark:text-white"
          placeholder="Search or paste link"
          placeholderTextColor="#9ca3af"
        />
      </View>
    </View>
  );
}
