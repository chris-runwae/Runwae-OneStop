import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Link, LinkMenu, LinkMenuAction } from 'expo-router';

import { Text, TripItemCards } from '@/components';
import { SavedItem } from '@/types';

type SavedItemsSectionProps = {
  tripId: string;
  savedItems: SavedItem[];
  handleRemoveSavedItem: (itemId: string) => void;
};
const SavedItemsSection = ({
  tripId,
  savedItems,
  handleRemoveSavedItem,
}: SavedItemsSectionProps) => {
  // RENDERS
  return (
    <FlashList
      data={savedItems}
      renderItem={({ item, index }: { item: SavedItem; index: number }) => (
        <Link href={`/trips/hotel/${item.id}`} asChild>
          <Link.Trigger>
            <View
              style={{
                flex: 1,
                paddingLeft: index % 2 === 0 ? 0 : 4,
                paddingRight: index % 2 === 0 ? 4 : 0,
              }}>
              <TripItemCards item={item} key={item.id} />
            </View>
          </Link.Trigger>
          <Link.Menu>
            <Link.MenuAction
              title="Remove"
              icon="trash"
              onPress={() => handleRemoveSavedItem(item.id)}
            />
          </Link.Menu>
        </Link>
      )}
      keyExtractor={(item: SavedItem) => item.id}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={<Text>No saved items found.</Text>}
    />
  );
};

export default SavedItemsSection;

const styles = StyleSheet.create({
  listContent: {
    // paddingHorizontal: 8,
    // gap: 8,
  },
});
