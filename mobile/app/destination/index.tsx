import DestinationCard from '@/components/home/DestinationCard';
import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import { DestinationCardSkeleton } from '@/components/ui/CardSkeletons';
import ScreenHeader from '@/components/ui/ScreenHeader';
import SearchInput from '@/components/ui/SearchInput';
import { Destination } from '@/types/content.types';
import { getDestinations } from '@/utils/supabase/destinations.service';
import React, { useMemo, useState } from 'react';
import { FlatList, Image, Text, View } from 'react-native';

const EmptyState = () => (
  <View className="w-full flex-1 items-center justify-center bg-gray-200 dark:bg-dark-seconndary/50">
    <Image
      source={require('@/assets/images/search-empty-icon.png')}
      className="mb-8 h-[80px] w-[80px]"
      resizeMode="contain"
    />
    <Text
      className="mb-2 text-center text-lg font-semibold leading-tight dark:text-white"
      style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
      Sorry, we couldn’t seem to find a match
    </Text>
    <Text className="text-center text-sm leading-relaxed text-gray-400">
      Want to try adjusting your words or use a {'\n'}different keyword.
    </Text>
  </View>
);

const DestinationsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [destinations, setDestinations] = useState<Destination[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDestinations();
        setDestinations(data);
      } catch (err) {
        console.error('DestinationsScreen: Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredDestinations = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return destinations.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
    );
  }, [searchQuery, destinations]);

  const displayData = (
    loading ? Array(6).fill({}) : filteredDestinations
  ) as Destination[];

  return (
    <AppSafeAreaView edges={['top']}>
      <ScreenHeader hasBorder={false} title="Destinations" />
      <View className="mt-5 border-b-2 border-b-gray-200 px-[20px] pb-5 dark:border-b-dark-seconndary">
        <SearchInput
          placeholder="Try searching “Tokyo”"
          showFilter={false}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {!loading && filteredDestinations.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={displayData}
          className="flex-1"
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 100,
            paddingHorizontal: 16,
            paddingTop: 20,
          }}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
          keyExtractor={(item, index) =>
            loading ? `skeleton-${index}` : item.id
          }
          renderItem={({ item }) => (
            <View style={{ width: '48%' }}>
              {loading ? (
                <DestinationCardSkeleton fullWidth={true} />
              ) : (
                <DestinationCard fullWidth item={item} />
              )}
            </View>
          )}
          ListEmptyComponent={<View />}
        />
      )}
    </AppSafeAreaView>
  );
};

export default DestinationsScreen;
