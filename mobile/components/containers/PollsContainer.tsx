import { Button, View, Text, StyleSheet, ScrollView } from 'react-native';
import React, { useCallback, useEffect } from 'react';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants';
import usePollActions from '@/hooks/usePollActions';
import { PollItem, Spacer } from '@/components';

export default function PollsContainer({ groupId }: { groupId: string }) {
  const { polls, fetchPolls } = usePollActions();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    callFetchPolls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const callFetchPolls = useCallback(async () => {
    await fetchPolls(groupId);

    console.log('should run once');
  }, [groupId]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
      {polls.length === 0 ? (
        <Text>No polls found</Text>
      ) : (
        <FlashList
          data={polls}
          renderItem={({ item }) => <PollItem poll={item} key={item.id} />}
          keyExtractor={(item) => item.id}
        />
      )}

      <Spacer size={16} vertical />
      <Button
        title="Create Poll"
        onPress={() => {
          router.push(`/(tabs)/(trips)/${groupId}/add-poll`);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
