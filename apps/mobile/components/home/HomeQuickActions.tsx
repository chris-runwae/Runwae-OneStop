import CategoryItem from '@/components/ui/CategoryItem';
import { detectPlatform } from '@/lib/urlPlatform';
import { useRouter } from 'expo-router';
import { MoveRight, Search, Sparkles } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  dark: boolean;
};

// First URL-like token in the input. Mirrors the regex in search.tsx so
// both paste paths behave identically.
const URL_RE = /https?:\/\/[^\s]+/i;

export default function HomeQuickActions({ dark }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const detectedUrl = useMemo(() => {
    const match = query.match(URL_RE);
    return match ? match[0] : null;
  }, [query]);

  const platform = useMemo(
    () => (detectedUrl ? detectPlatform(detectedUrl) : 'unknown'),
    [detectedUrl],
  );
  const aiReady = detectedUrl !== null && platform !== 'unknown';

  const handleAiPress = () => {
    Keyboard.dismiss();
    if (!detectedUrl) {
      Alert.alert(
        'Paste a link first',
        'Drop a YouTube or TikTok URL in here and we’ll turn it into a trip.',
      );
      return;
    }
    if (platform === 'unknown') {
      Alert.alert(
        'Unsupported link',
        'Only YouTube and TikTok links are supported right now.',
      );
      return;
    }
    const idempotencyKey = `link_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    router.push({
      pathname: '/create-trip-from-link',
      params: { url: detectedUrl, idempotencyKey },
    });
  };

  const handleSubmit = () => {
    if (aiReady) {
      handleAiPress();
      return;
    }
    if (query.trim().length === 0) return;
    // Fall back to the structured search screen with the typed term so a
    // plain-text query still has a destination.
    router.push({ pathname: '/search', params: { term: query.trim() } });
  };

  return (
    <View className="gap-y-6 px-5">
      <View className="flex-row justify-between">
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
        className="flex-row items-center gap-x-2"
        onPress={() => router.push('/search')}>
        <View className="flex-row items-center gap-x-1">
          <Sparkles size={12} fill="#ec4899" stroke="#ec4899" />
          <Text className="text-sm font-bold text-pink-500">NEW</Text>
        </View>
        <View className="h-3 w-[1px] bg-gray-300" />
        <Text className="text-sm text-gray-500">Paste a YouTube or TikTok link</Text>
        <MoveRight size={14} color="#6b7280" className="mx-2" />
        <Text className="text-sm text-gray-500">Generate Itinerary</Text>
      </Pressable>

      <View
        className="h-14 flex-row items-center gap-x-3 rounded-full bg-white px-5 dark:bg-dark-seconndary"
        style={{
          shadowColor: dark ? '#ffffff' : '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
        <Search size={20} color="#9ca3af" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search or paste link"
          placeholderTextColor="#9ca3af"
          selectionColor="#fd2879"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
          className="flex-1 text-base text-black dark:text-white"
          accessibilityLabel="Search or paste a YouTube or TikTok link"
        />
        <TouchableOpacity
          onPress={handleAiPress}
          disabled={!aiReady}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={
            aiReady
              ? 'Create itinerary from this link'
              : 'Paste a YouTube or TikTok link to enable'
          }
          accessibilityState={{ disabled: !aiReady }}
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{
            backgroundColor: aiReady ? '#FF1F8C' : 'transparent',
            opacity: aiReady ? 1 : 0.45,
          }}>
          <Sparkles
            size={16}
            color={aiReady ? '#ffffff' : '#9ca3af'}
            fill={aiReady ? '#ffffff' : 'transparent'}
            strokeWidth={2.2}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
