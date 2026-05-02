import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  View,
  useColorScheme,
} from 'react-native';
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical } from 'lucide-react-native';
import { router } from 'expo-router';

import ProfileAvatar from '@/components/ui/ProfileAvatar';
import Spacer from '@/components/utils/Spacer';
import Text from '@/components/ui/Text';
import { Colors, textStyles } from '@/constants';
import { Post } from '@/hooks/usePostActions';
import { useAuth } from '@/hooks/useAuth';

type PostItemProps = {
  post: Post;
  groupId: string;
  onDeletePost: (postId: string) => Promise<void>;
  isMember: boolean;
};

const PostItem = ({
  post,
  groupId,
  onDeletePost,
  isMember,
}: PostItemProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const isCreator =
    (post.createdByUserId as unknown as string) === user?.id;
  const createdAt = formatDistanceToNow(new Date(post.createdAt));
  const postId = post._id as unknown as string;

  const handleDelete = () => {
    Alert.alert('Delete post', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDeletePost(postId),
      },
    ]);
  };

  const handleEdit = () => {
    router.push(`/(tabs)/(trips)/${groupId}/add-post?postId=${postId}`);
  };

  const handleEllipsisPress = () => {
    if (!isMember) return;
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Edit post', 'Delete post'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleEdit();
          if (buttonIndex === 2) handleDelete();
        }
      );
    } else {
      Alert.alert('Post options', undefined, [
        { text: 'Edit post', onPress: handleEdit },
        { text: 'Delete post', style: 'destructive', onPress: handleDelete },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.backgroundColors.subtle,
        padding: 20,
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.borderColors.subtle,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
      }}>
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            flex: 1,
          }}>
          <ProfileAvatar
            name={post.author?.name ?? 'User'}
            imageUrl={post.author?.avatarUrl ?? post.author?.image}
            size={40}
          />
          <View>
            <Text style={{ ...textStyles.textHeading16, color: colors.textColors.default }}>
              {post.author?.name ?? 'User'}
            </Text>
            <Text
              style={{
                ...textStyles.textBody12,
                color: colors.textColors.subtle,
                marginTop: 2,
              }}>
              {createdAt} ago
            </Text>
          </View>
        </View>

        {isMember && isCreator && (
          <Pressable
            onPress={handleEllipsisPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              width: 32,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              borderRadius: 16,
            }}>
            <MoreVertical size={18} color={colors.textColors.subtle} />
          </Pressable>
        )}
      </View>

      <Spacer size={16} vertical />

      <Text
        style={{
          fontSize: 16,
          lineHeight: 24,
          color: colors.textColors.default,
          fontWeight: '400',
        }}>
        {post.content}
      </Text>

      {/* Placeholder for future media support */}
      {/* <Spacer size={12} vertical /> */}
    </View>
  );
};

export default PostItem;
