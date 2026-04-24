import SkeletonBox from '@/components/ui/SkeletonBox';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Divider = () => (
  <View className="mx-5 h-[1px] bg-gray-100 dark:bg-white/5" />
);

const EventDetailSkeleton = () => {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Sticky header row */}
      <View
        className="absolute left-0 right-0 top-0 z-10 flex-row items-center justify-between px-5"
        style={{ paddingTop: insets.top + 12 }}>
        <SkeletonBox width={40} height={40} borderRadius={20} />
        <View className="flex-row gap-x-3">
          <SkeletonBox width={40} height={40} borderRadius={20} />
          <SkeletonBox width={40} height={40} borderRadius={20} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>

        {/* Hero image */}
        <SkeletonBox width="100%" height={360} borderRadius={0} />

        {/* Title + stat chips */}
        <View className="px-5 pb-2 pt-5">
          <SkeletonBox width="75%" height={28} borderRadius={8} />
          <View className="mt-3 flex-row flex-wrap gap-2">
            <SkeletonBox width={130} height={30} borderRadius={100} />
            <SkeletonBox width={100} height={30} borderRadius={100} />
            <SkeletonBox width={85}  height={30} borderRadius={100} />
          </View>
        </View>

        {/* Participants bar */}
        <View className="px-5 pb-4 pt-2">
          <SkeletonBox width="100%" height={6} borderRadius={100} />
          <View className="mt-2">
            <SkeletonBox width={120} height={12} borderRadius={4} />
          </View>
        </View>

        <Divider />

        {/* About section */}
        <View className="px-5 py-6">
          <SkeletonBox width={160} height={18} borderRadius={6} />
          <View className="mt-4 gap-y-2.5">
            <SkeletonBox width="100%" height={13} borderRadius={4} />
            <SkeletonBox width="100%" height={13} borderRadius={4} />
            <SkeletonBox width="85%"  height={13} borderRadius={4} />
            <SkeletonBox width="60%"  height={13} borderRadius={4} />
          </View>
        </View>

        <Divider />

        {/* Gallery strip */}
        <View className="py-6">
          <View className="mb-4 flex-row items-center justify-between px-5">
            <SkeletonBox width={80} height={18} borderRadius={6} />
            <SkeletonBox width={60} height={14} borderRadius={4} />
          </View>
          <View className="flex-row gap-x-3 px-5">
            <SkeletonBox width={220} height={160} borderRadius={16} />
            <SkeletonBox width={220} height={160} borderRadius={16} />
          </View>
        </View>

        <Divider />

        {/* Highlights */}
        <View className="px-5 py-6">
          <SkeletonBox width={120} height={18} borderRadius={6} />
          <View className="mt-4 gap-y-3">
            {[100, 85, 70].map((w, i) => (
              <View key={i} className="flex-row items-center gap-x-3">
                <SkeletonBox width={18} height={18} borderRadius={9} />
                <SkeletonBox width={`${w}%` as any} height={13} borderRadius={4} />
              </View>
            ))}
          </View>
        </View>

        <Divider />

        {/* Location map */}
        <View className="px-5 py-6">
          <SkeletonBox width={100} height={18} borderRadius={6} />
          <View className="mt-4 overflow-hidden rounded-2xl">
            <SkeletonBox width="100%" height={200} borderRadius={16} />
            <View className="mt-2 flex-row items-center justify-between">
              <SkeletonBox width={180} height={14} borderRadius={4} />
              <SkeletonBox width={90} height={30} borderRadius={100} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky pricing bar placeholder */}
      <View
        className="absolute bottom-0 left-0 right-0 flex-row items-center justify-between border-t border-gray-100 bg-white px-5 py-4 dark:border-white/5 dark:bg-black"
        style={{ paddingBottom: insets.bottom + 12 }}>
        <View className="gap-y-1.5">
          <SkeletonBox width={90} height={11} borderRadius={4} />
          <SkeletonBox width={120} height={22} borderRadius={6} />
        </View>
        <SkeletonBox width={130} height={52} borderRadius={16} />
      </View>
    </View>
  );
};

export default EventDetailSkeleton;
