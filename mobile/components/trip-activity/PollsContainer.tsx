import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Pressable,
} from 'react-native';
import React, { useCallback, useEffect } from 'react';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Vote } from 'lucide-react-native';

import usePollActions from '@/hooks/usePollActions';
import { PollItem, Spacer } from '@/components';
import { textStyles, Colors } from '@/constants';

export default function PollsContainer({ groupId }: { groupId: string }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { polls, fetchPolls } = usePollActions();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    callFetchPolls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const callFetchPolls = useCallback(async () => {
    await fetchPolls(groupId);
  }, [groupId, fetchPolls]);

  // const dynamicStyles = StyleSheet.create({
  //   headerDivider: {
  //     width: '100%',
  //     height: 2,
  //     backgroundColor: colors.borderColors.subtle,
  //     marginVertical: -16,
  //   },
  // });

  const renderHeader = () => {
    return (
      <>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Polls</Text>

          <Pressable
            style={styles.headerButton}
            onPress={() => {
              router.push(`/(tabs)/(trips)/${groupId}/add-poll`);
            }}>
            <Plus size={16} color={colors.primaryColors.default} />
            <Text style={{ color: colors.primaryColors.default }}>
              Add poll
            </Text>
          </Pressable>
        </View>

        {/* <View style={dynamicStyles.headerDivider} /> */}

        <Spacer size={16} vertical />
      </>
    );
  };
  const renderEmptyState = () => {
    return (
      <View style={styles.emptyStateContainer}>
        <Vote size={40} color={colors.primaryColors.default} />
        <Text style={styles.emptyStateTitle}>No polls found</Text>
        <Text style={styles.emptyStateBody}>
          Create your first poll to get started
        </Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
      <FlashList
        data={polls}
        renderItem={({ item }) => <PollItem poll={item} key={item.id} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
      />

      <Spacer size={16} vertical />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerTitle: {
    ...textStyles.textHeading16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  // Empty state
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyStateTitle: {
    ...textStyles.textHeading16,
  },
  emptyStateBody: {
    ...textStyles.textBody12,
  },
});
