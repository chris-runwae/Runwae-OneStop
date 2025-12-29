// Save as: @/components/TripDiscoverySection/HotelsSectionSkeleton.tsx

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/components/ui/Skeleton'; // Adjust based on your skeleton component
import { Spacer } from '@/components';

export const HotelsSectionSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Two columns of skeleton items */}
      <View style={styles.row}>
        <View style={styles.column}>
          <SkeletonItem />
        </View>
        <View style={styles.column}>
          <SkeletonItem />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.column}>
          <SkeletonItem />
        </View>
        <View style={styles.column}>
          <SkeletonItem />
        </View>
      </View>
    </View>
  );
};

const SkeletonItem = () => {
  return (
    <View style={styles.skeletonItem}>
      {/* Image skeleton */}
      <Skeleton width="100%" height={200} borderRadius={8} />
      <Spacer size={8} vertical />

      {/* Title skeleton */}
      <Skeleton width="80%" height={16} borderRadius={4} />
      <Spacer size={8} vertical />

      {/* Description lines */}
      <Skeleton width="100%" height={14} borderRadius={4} />
      <Spacer size={4} vertical />
      <Skeleton width="90%" height={14} borderRadius={4} />
      <Spacer size={4} vertical />
      <Skeleton width="70%" height={14} borderRadius={4} />

      <Spacer size={16} vertical />

      {/* Footer with button */}
      <View style={styles.footer}>
        <Skeleton width={80} height={20} borderRadius={4} />
        <Skeleton width={70} height={36} borderRadius={8} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  column: {
    flex: 1,
  },
  skeletonItem: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
