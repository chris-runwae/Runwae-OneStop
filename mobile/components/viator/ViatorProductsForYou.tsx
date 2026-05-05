import { AddOnCardSkeleton } from '@/components/ui/CardSkeletons';
import SectionHeader from '@/components/ui/SectionHeader';
import type { ViatorProduct } from '@/types/viator.types';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Text, View } from 'react-native';

import ViatorProductCard from './ViatorProductCard';

interface ViatorProductsForYouProps {
  data: ViatorProduct[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
  showSubtitle?: boolean;
  showBorder?: boolean;
}

const ViatorProductsForYou = ({
  data,
  title = 'Tours & activities',
  subtitle = 'Powered by Viator',
  loading = false,
  showSubtitle = true,
  showBorder = true,
}: ViatorProductsForYouProps) => {
  const displayData = loading ? (Array(5).fill({}) as ViatorProduct[]) : data;
  const router = useRouter();
  const isNavigating = React.useRef(false);

  const handleHeaderPress = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.navigate('/viator');
    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  };

  return (
    <View className={`mt-5 ${showBorder ? 'pb-5' : ''}`}>
      <SectionHeader
        title={title}
        subtitle={showSubtitle ? subtitle : undefined}
        onPress={handleHeaderPress}
      />

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
          loading ? `viator-skeleton-${index}` : item.productCode
        }
        ItemSeparatorComponent={() => <View className="w-3" />}
        renderItem={({ item, index }) =>
          loading ? (
            <AddOnCardSkeleton />
          ) : (
            <ViatorProductCard product={item} index={index} />
          )
        }
        ListEmptyComponent={
          !loading ? (
            <View className="flex w-full items-center justify-center py-8">
              <Text className="mb-3 text-3xl">🧭</Text>
              <Text
                className="text-base font-semibold dark:text-white"
                style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
                No tours found
              </Text>
              <Text className="mt-1 text-center text-xs text-gray-400">
                Try again later or adjust filters.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default ViatorProductsForYou;
