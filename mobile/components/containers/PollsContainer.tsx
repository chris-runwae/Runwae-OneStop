import { Button, View, Text, StyleSheet } from "react-native";
import React, { useCallback, useEffect } from "react";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";

import { Colors } from "@/constants";
import usePollActions from "@/hooks/usePollActions";

export default function PollsContainer( { groupId }: { groupId: string } ) {
  const { polls, fetchPolls } = usePollActions();

  useEffect(() => {
    callFetchPolls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const callFetchPolls = useCallback(async () => {
    await fetchPolls(groupId);

    console.log('should run once');
  }, [groupId]);

  return (
    <View style={styles.container}>

      {polls.length === 0 ? (
        <Text>No polls found</Text>
      ) : (
        <FlashList
          data={polls}
          renderItem={({ item }) => <Text>{item.title}</Text>}
          keyExtractor={item => item.id}
        />
      )}

      <Button title="Create Poll" onPress={() => {router.push(`/(tabs)/(trips)/${groupId}/add-poll`)}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
});   