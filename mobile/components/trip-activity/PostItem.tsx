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
  const { user } = useAuth();
  const isCreator = post.created_by === user?.id;
  const createdAt = formatDistanceToNow(new Date(post.created_at));

  const handleDelete = () => {
    Alert.alert('Delete post', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDeletePost(post.id),
      },
    ]);
  };

  const handleEdit = () => {
    router.push(`/(tabs)/(trips)/${groupId}/add-post?postId=${post.id}`);
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
        paddingHorizontal: 8,
        paddingVertical: 16,
        borderRadius: 16,
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
            gap: 8,
            flex: 1,
          }}>
          <ProfileAvatar
            name={post.creator.full_name}
            imageUrl={post.creator.avatar_url}
          />
          <View>
            <Text style={textStyles.textHeading16}>
              {post.creator.full_name}
            </Text>
            <Text
              style={{
                ...textStyles.textBody12,
                color: colors.textColors.subtle,
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
              width: 30,
              height: 30,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <MoreVertical size={20} color={colors.textColors.subtle} />
          </Pressable>
        )}
      </View>

      <Spacer size={12} vertical />

      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: colors.textColors.default,
        }}>
        {post.content}
      </Text>

      <Spacer size={16} vertical />
    </View>
  );
};

export default PostItem;
