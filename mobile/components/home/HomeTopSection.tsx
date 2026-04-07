import CategoryItem from '@/components/ui/CategoryItem';
import { useRouter } from 'expo-router';
import { getLinkPreview } from 'link-preview-js';
import { MoveRight, Search, Sparkles } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

interface HomeTopSectionProps {
  user: any;
  dark?: boolean;
}

export default function HomeTopSection({ user, dark }: HomeTopSectionProps) {
  const router = useRouter();
  const firstName = user?.full_name?.split(' ')[0] || 'Aki';

  const [searchQuery, setSearchQuery] = React.useState('');
  const [previewData, setPreviewData] = React.useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = React.useState(false);

  const handleTextChange = async (text: string) => {
    setSearchQuery(text);

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex);

    if (urls && urls.length > 0) {
      if (previewData && previewData.url === urls[0]) return;
      setIsLoadingPreview(true);
      try {
        const data = await getLinkPreview(urls[0]);
        setPreviewData(data);
      } catch (e) {
        console.log('Preview error', e);
        setPreviewData(null);
      } finally {
        setIsLoadingPreview(false);
      }
    } else {
      setPreviewData(null);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setPreviewData(null);
  };

  const shadowStyles =
    Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        }
      : { elevation: 5 };

  return (
    <View className="px-5 pb-4 pt-8">
      <Text
        className="mb-8 text-2xl font-bold leading-tight text-black dark:text-white"
        style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
        Let's plan your next{'\n'}adventure, {firstName}. ☀️
      </Text>

      {/* Categories */}
      <View className="mb-8 flex-row justify-between px-2">
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
            router.push({ pathname: '/search', params: { tab: 'experiences' } })
          }
        />
      </View>

      <View className="mb-6 h-[1px] w-full bg-gray-100 dark:bg-dark-seconndary" />

      <Pressable
        className="mb-4 flex-row items-center gap-x-2 px-2"
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

      {/* Search Bar */}
      <Pressable
        className="h-14 flex-row items-center gap-x-3 rounded-full bg-white px-4 dark:bg-dark-seconndary"
        style={shadowStyles}
        onPress={() => router.push('/search' as any)}>
        <Search size={20} color="#9ca3af" />
        <Text className="flex-1 text-base text-[#9ca3af]">
          Search or paste link
        </Text>
      </Pressable>
    </View>
  );
}
