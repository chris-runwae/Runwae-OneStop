import React from 'react';
import { View, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SkeletonBox from '@/components/ui/SkeletonBox';
import { Colors } from '@/constants/theme';
import { useTheme } from '@react-navigation/native';

export default function EditTripSkeleton() {
  const insets = useSafeAreaInsets();
  const { dark } = useTheme();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundColors.default, paddingTop: insets.top + 10 }]}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <View style={{ width: 60 }}>
          <SkeletonBox width={50} height={20} borderRadius={4} />
        </View>
        <SkeletonBox width={100} height={24} borderRadius={4} />
        <View style={{ width: 60, alignItems: 'flex-end' }}>
          <SkeletonBox width={40} height={20} borderRadius={4} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Skeleton */}
        <View style={styles.imageContainer}>
          <SkeletonBox width="100%" height={200} borderRadius={0} />
        </View>

        <View style={styles.form}>
          {/* Form Fields Skeletons */}
          <View style={styles.inputGroup}>
            <View style={{ marginBottom: 8 }}>
              <SkeletonBox width={80} height={14} borderRadius={4} />
            </View>
            <SkeletonBox width="100%" height={50} borderRadius={12} />
          </View>

          <View style={styles.inputGroup}>
            <View style={{ marginBottom: 8 }}>
              <SkeletonBox width={100} height={14} borderRadius={4} />
            </View>
            <SkeletonBox width="100%" height={100} borderRadius={12} />
          </View>

          {/* Info Row Skeletons */}
          <View style={styles.infoRow}>
            <SkeletonBox width={40} height={40} borderRadius={20} />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <SkeletonBox width={80} height={12} borderRadius={4} />
              <View style={{ height: 4 }} />
              <SkeletonBox width={140} height={16} borderRadius={4} />
            </View>
          </View>

          <View style={styles.infoRow}>
            <SkeletonBox width={40} height={40} borderRadius={20} />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <SkeletonBox width={60} height={12} borderRadius={4} />
              <View style={{ height: 4 }} />
              <SkeletonBox width={160} height={16} borderRadius={4} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#33333333',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageContainer: {
    height: 200,
    width: '100%',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#33333311',
  },
});
