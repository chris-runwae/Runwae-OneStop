import { Pressable, StyleSheet, View } from 'react-native';
import React from 'react';
import { ImageBackground } from 'expo-image';

import { TripItineraryItem } from '@/types/trips.types';
import { PrimaryButton, Text } from '@/components';

const ItineraryItemCard = ({ item }: { item: any }) => {
  const ActivityTypePill = ({ activityType }: { activityType: string }) => {
    return (
      <View style={styles.activityTypePill}>
        <Text>{activityType}</Text>
      </View>
    );
  };

  const title = item?.name || item?.title || 'No title';
  const description = item?.description || 'No description';
  const coverImage =
    item?.cover_image ||
    'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80';

  console.log('Item: ', item);

  return (
    <Pressable
      onPress={() => console.log('ItineraryItemCard pressed')}
      style={styles.container}>
      <ImageBackground
        source={{
          uri:
            item.cover_image ??
            'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80',
        }}
        style={styles.imageBackground}>
        <ActivityTypePill activityType={item?.source_type || 'Stays'} />
      </ImageBackground>
      <View style={styles.contentContainer}>
        <Text>{title}</Text>
        <Text>{description}</Text>
      </View>
      <View style={styles.footerContainer}>
        <Text>View more</Text>
        <PrimaryButton
          title="Add"
          onPress={() => console.log('Add to itinerary pressed')}
        />
      </View>
    </Pressable>
  );
};

export default ItineraryItemCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageBackground: {
    width: '100%',
    height: 200,
  },
  contentContainer: {
    padding: 16,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  activityTypePill: {
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 10,
  },
});
