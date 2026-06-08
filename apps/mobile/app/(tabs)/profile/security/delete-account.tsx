import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { ArrowLeft, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';

import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import { useAuth } from '@/context/AuthContext';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  const deleteAccount = useMutation(api.account_deletion.deleteAccountImmediate);

  const [busy, setBusy] = useState(false);

  const onRequestDelete = () => {
    Alert.alert(
      'Delete account',
      'This permanently deletes your account along with your trips, saved items, posts, and bookings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await deleteAccount({});
              await signOut();
              router.replace('/(auth)/onboarding' as any);
            } catch (err) {
              Alert.alert(
                'Could not delete',
                err instanceof Error ? err.message : 'Try again later.',
              );
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  return (
    <AppSafeAreaView edges={['top']}>
      <View className="px-5 pt-4 pb-2 flex-row items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 rounded-full bg-gray-200 dark:bg-dark-seconndary items-center justify-center">
          <ArrowLeft size={18} color="#000" />
        </Pressable>
        <Text
          className="text-2xl text-black dark:text-white"
          style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
          Delete Account
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 80 }}>
        <View className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mt-4 flex-row items-start gap-3">
          <AlertTriangle size={20} color="#DC2626" />
          <Text className="flex-1 text-sm text-red-700 dark:text-red-300">
            Deleting your account permanently removes your profile, trips, saved
            items, posts, and bookings. This is immediate and cannot be undone.
          </Text>
        </View>

        <Pressable
          disabled={busy}
          onPress={onRequestDelete}
          className="mt-8 bg-red-600 py-4 rounded-full items-center">
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold">Delete my account</Text>
          )}
        </Pressable>
      </ScrollView>
    </AppSafeAreaView>
  );
}
