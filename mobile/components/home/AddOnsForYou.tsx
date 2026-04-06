import { AddOnCardSkeleton } from '@/components/ui/CardSkeletons';
import SectionHeader from '@/components/ui/SectionHeader';
import { AddOn } from '@/constants/home.constant';
import { useRouter } from 'expo-router';
import React from 'react';

import { FlatList, Text, View } from 'react-native';
import AddOnCard from './AddOnCard';

interface AddOnsForYouProps {
  data: AddOn[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
  showSubtitle?: boolean;
  showBorder?: boolean;
}

const AddOnsForYou = ({
  data,
  title = 'Trip Suggestions',
  loading = false,
  showSubtitle = true,
  showBorder = true,
}: AddOnsForYouProps) => {
  const displayData = loading ? Array(5).fill({}) : data;
  const router = useRouter();
  const isNavigating = React.useRef(false);

  const handleHeaderPress = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.navigate('/experience');
    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  };

  return (
    <View className={`mt-5 ${showBorder ? 'pb-5' : ''}`}>
      {showSubtitle && (
        <SectionHeader title={title} onPress={handleHeaderPress} />
      )}

      <FlatList
        data={displayData}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          marginTop: 30,
          paddingHorizontal: 20,
        }}
        keyExtractor={(item, index) =>
          loading ? `skeleton-${index}` : item.id
        }
        ItemSeparatorComponent={() => <View className="w-3" />}
        renderItem={({ item, index }) =>
          loading ? (
            <AddOnCardSkeleton />
          ) : (
            <AddOnCard item={item} index={index} />
          )
        }
        ListEmptyComponent={
          <View className="flex w-full items-center justify-center py-8">
            <Text className="mb-3 text-3xl">🎫</Text>
            <Text
              className="text-base font-semibold dark:text-white"
              style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
              No activities found
            </Text>
            <Text className="mt-1 text-center text-xs text-gray-400">
              Check back for deals and activities!
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default AddOnsForYou;
