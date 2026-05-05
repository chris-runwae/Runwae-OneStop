import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Spacer } from '@/components';
import SkeletonBox from '@/components/ui/SkeletonBox';

interface Props {
  insetTop: number;
}

export default function TripDetailSkeleton({ insetTop }: Props) {
  const HERO_HEIGHT_FIXED = 300;
  
  return (
    <View style={styles.container}>
      <View style={{ height: HERO_HEIGHT_FIXED }}>
        <SkeletonBox width="100%" height={HERO_HEIGHT_FIXED} borderRadius={0} />

        <TouchableOpacity
          style={[styles.backButton, { top: insetTop + 12 }]}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={22} strokeWidth={2.5} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.contentContainer, { paddingTop: 24 }]}>
        {/* Title */}
        <SkeletonBox width={220} height={28} borderRadius={6} />

        <Spacer size={16} vertical />

        {/* Destination & Date Pills */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <SkeletonBox width={120} height={24} borderRadius={20} />
          <SkeletonBox width={140} height={24} borderRadius={20} />
        </View>

        <Spacer size={14} vertical />

        {/* Description Lines */}
        <View style={{ gap: 6 }}>
          <SkeletonBox width="95%" height={14} borderRadius={4} />
          <SkeletonBox width="90%" height={14} borderRadius={4} />
          <SkeletonBox width="60%" height={14} borderRadius={4} />
        </View>

        <Spacer size={14} vertical />

        {/* Solo Badge / Avatar Placeholder */}
        <SkeletonBox width={80} height={24} borderRadius={20} />

        <Spacer size={32} vertical />

        {/* Tabs Bar */}
        <View style={{ flexDirection: 'row', gap: 20 }}>
          <SkeletonBox width={50} height={16} borderRadius={4} />
          <SkeletonBox width={70} height={16} borderRadius={4} />
          <SkeletonBox width={70} height={16} borderRadius={4} />
          <SkeletonBox width={40} height={16} borderRadius={4} />
        </View>

        <Spacer size={24} vertical />

        {/* Idea Cards Grid Placeholder */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={{ width: '48%', gap: 8, marginBottom: 16 }}>
              <SkeletonBox width="100%" height={160} borderRadius={10} />
              <SkeletonBox width="80%" height={14} borderRadius={4} />
              <SkeletonBox width="100%" height={10} borderRadius={4} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 12,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
