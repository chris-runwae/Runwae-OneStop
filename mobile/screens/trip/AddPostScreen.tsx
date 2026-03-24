import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TextInput,
  useColorScheme,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { Text, Spacer } from '@/components';
import { Colors, textStyles } from '@/constants';
import usePostActions from '@/hooks/usePostActions';
import { useAuth } from '@/context/AuthContext';

export default function AddPostScreen() {
  const { tripId, postId } = useLocalSearchParams<{
    tripId: string;
    postId?: string;
  }>();
  const isEditMode = !!postId;
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const { user } = useAuth();
  const { createPost, updatePost, fetchPostById, isLoading } = usePostActions();

  const [content, setContent] = useState('');

  useEffect(() => {
    if (!postId) return;
    fetchPostById(postId).then((post) => setContent(post.content));
  }, [postId]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    try {
      if (isEditMode) {
        await updatePost(postId, content.trim());
      } else {
        await createPost(tripId, content.trim(), user?.id as string);
      }
      router.dismiss();
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} post:`, error);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} post. Please try again.`);
    }
  };

  const styles = StyleSheet.create({
    button: {
      backgroundColor: '#ffdde6',
      borderColor: '#ffdde6',
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 8,
    },
    buttonText: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'Inter-Regular',
      color: '#ff2e92',
    },
    contentInput: {
      fontSize: 15,
      lineHeight: 22,
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.borderColors.subtle,
      backgroundColor: colors.backgroundColors.subtle,
      borderRadius: 8,
      color: colors.textColors.default,
      minHeight: 140,
      textAlignVertical: 'top',
    },
    labelStyle: {
      ...textStyles.textHeading16,
      fontSize: 14,
      color: colors.textColors.default,
      marginBottom: 4,
    },
  });

  return (
    <KeyboardAwareScrollView
      style={{
        paddingHorizontal: 16,
        flex: 1,
        backgroundColor: colors.backgroundColors.default,
        height: '100%',
      }}
      contentContainerStyle={{ flexGrow: 1 }}
      bottomOffset={100}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 24,
          paddingBottom: 8,
          borderBottomWidth: 2,
          borderBottomColor: colors.borderColors.subtle,
        }}>
        <Pressable
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => router.dismiss()}
          style={{ width: 60 }}>
          <Text style={{ fontSize: 14 }}>Close</Text>
        </Pressable>
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            textAlign: 'center',
            flex: 1,
          }}>
          {isEditMode ? 'Edit Post' : 'New Post'}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <Spacer size={24} vertical />

      <Text style={styles.labelStyle}>
        What&apos;s on your mind?
      </Text>
      <TextInput
        multiline
        placeholder="Share something with the group..."
        placeholderTextColor={colors.textColors.subtle}
        style={styles.contentInput}
        value={content}
        onChangeText={setContent}
        autoFocus
      />

      <Spacer size={24} vertical />

      <Pressable
        onPress={handleSubmit}
        disabled={isLoading || !content.trim()}
        style={[styles.button, { opacity: !content.trim() ? 0.5 : 1 }]}>
        {isLoading ? (
          <ActivityIndicator size={24} color={colors.textColors.default} />
        ) : (
          <Text style={styles.buttonText}>
            {isEditMode ? 'Update Post' : 'Post'}
          </Text>
        )}
      </Pressable>
    </KeyboardAwareScrollView>
  );
}
