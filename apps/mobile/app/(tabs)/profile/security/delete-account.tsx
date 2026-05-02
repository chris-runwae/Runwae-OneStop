import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { ArrowLeft, AlertTriangle, RotateCcw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@runwae/convex/convex/_generated/api';

import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import { useAuth } from '@/context/AuthContext';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  const blockers = useQuery(api.account_deletion.getDeletionBlockers, {});
  const requestDeletion = useMutation(
    api.account_deletion.requestAccountDeletion,
  );
  const restore = useMutation(api.account_deletion.restoreAccount);

  const [busy, setBusy] = useState(false);

  const isPendingDeletion = (blockers as any)?.isPendingDeletion === true;

  const onRequestDelete = () => {
    Alert.alert(
      'Delete account',
      'Your account will be soft-deleted for 30 days. After that it will be permanently removed. You can restore it any time within those 30 days by signing back in.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await requestDeletion({});
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

  const onRestore = async () => {
    setBusy(true);
    try {
      await restore({});
      Alert.alert('Welcome back', 'Your account has been restored.');
      router.back();
    } catch (err) {
      Alert.alert(
        'Could not restore',
        err instanceof Error ? err.message : 'Try again later.',
      );
    } finally {
      setBusy(false);
    }
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
            Deleting your account removes your trips, saved items, posts, and
            bookings after a 30-day grace period. This cannot be undone after
            the grace period ends.
          </Text>
        </View>

        {blockers === undefined ? (
          <View className="mt-6 items-center">
            <ActivityIndicator color="#FF1F8C" />
          </View>
        ) : Array.isArray((blockers as any)?.blockers) &&
          (blockers as any).blockers.length > 0 ? (
          <View className="mt-6">
            <Text
              className="text-base text-black dark:text-white mb-2"
              style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
              Resolve these first
            </Text>
            {(blockers as any).blockers.map((b: string, i: number) => (
              <Text key={i} className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                · {b}
              </Text>
            ))}
          </View>
        ) : null}

        {isPendingDeletion ? (
          <Pressable
            disabled={busy}
            onPress={onRestore}
            className="mt-8 bg-primary py-4 rounded-full items-center flex-row justify-center gap-2">
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <RotateCcw size={16} color="#fff" />
                <Text className="text-white font-semibold">
                  Restore my account
                </Text>
              </>
            )}
          </Pressable>
        ) : (
          <Pressable
            disabled={busy}
            onPress={onRequestDelete}
            className="mt-8 bg-red-600 py-4 rounded-full items-center">
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold">
                Delete my account
              </Text>
            )}
          </Pressable>
        )}
      </ScrollView>
    </AppSafeAreaView>
  );
}
