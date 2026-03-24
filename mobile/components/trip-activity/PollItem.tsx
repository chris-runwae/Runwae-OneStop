import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Poll } from '@/hooks/usePollActions';

const PollItem = ({ poll }: { poll: Poll }) => {
  //Complete the UI for this
  return (
    <View>
      <Text>{poll.title}</Text>
    </View>
  );
};

export default PollItem;

const styles = StyleSheet.create({});
