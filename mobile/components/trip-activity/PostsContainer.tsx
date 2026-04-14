import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { FileText, Plus } from 'lucide-react-native';
import React, { useCallback, useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Text from '@/components/ui/Text';
import Spacer from '@/components/utils/Spacer';
import { Colors, textStyles } from '@/constants';
import usePostActions from '@/hooks/usePostActions';
import PostItem from './PostItem';

export default function PostsContainer({
  groupId,
  isMember,
}: {
  groupId: string;
  isMember: boolean;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { posts, fetchPosts, deletePost } = usePostActions();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    callFetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const callFetchPosts = useCallback(async () => {
    await fetchPosts(groupId);
  }, [groupId, fetchPosts]);

  const renderHeader = () => {
    const postCount = posts?.length ?? 0;
    const postCountText =
      postCount === 0
        ? `${postCount} posts`
        : postCount === 1
          ? '1 post'
          : `${postCount} posts`;
    return (
      <>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{postCountText}</Text>
          {isMember && (
            <Pressable
              style={styles.headerButton}
              onPress={() =>
                router.push(`/(tabs)/(trips)/${groupId}/add-post`)
              }>
              <Plus size={16} color={colors.primaryColors.default} />
              <Text style={{ color: colors.primaryColors.default }}>
                Add post
              </Text>
            </Pressable>
          )}
        </View>
        <Spacer size={16} vertical />
      </>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <FileText size={40} color={colors.primaryColors.default} />
      <Text style={styles.emptyStateTitle}>No posts yet</Text>
      <Text style={styles.emptyStateBody}>
        Be the first to post something to the trip
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
      <FlashList
        data={posts}
        renderItem={({ item }) => (
          <PostItem
            post={item}
            key={item.id}
            groupId={groupId}
            onDeletePost={deletePost}
            isMember={isMember}
          />
        )}
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
