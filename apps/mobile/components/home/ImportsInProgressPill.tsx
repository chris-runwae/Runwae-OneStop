import {
  useDismissImport,
  useMyActiveImports,
} from '@/hooks/useAiTripActions';
import { useTheme } from "expo-router/react-navigation";
import { router } from 'expo-router';
import {
  ChevronRight,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const STATUS_LABELS: Record<string, string> = {
  queued: 'Queued',
  extracting: 'Reading link',
  transcribing: 'Listening',
  planning: 'Drafting itinerary',
  materializing: 'Almost done',
  done: 'Ready',
  failed: 'Failed',
};

// Home-screen subscriber to media_imports. Renders nothing when there
// are no active imports. One pill per active import — typical case is
// one at a time, but pills stack vertically if a user kicks off several.
export default function ImportsInProgressPill() {
  const { dark } = useTheme();
  const imports = useMyActiveImports();
  const dismissImport = useDismissImport();

  if (!imports || imports.length === 0) return null;

  const handleDismiss = (importId: string) => {
    Alert.alert(
      'Dismiss this import?',
      "We'll stop showing this card on your home screen.",
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Dismiss',
          style: 'destructive',
          onPress: () => {
            void dismissImport({ importId: importId as never }).catch(() => {});
          },
        },
      ],
    );
  };

  return (
    <View style={{ paddingHorizontal: 20, gap: 8 }}>
      {imports.map((row) => {
        const labelBase = STATUS_LABELS[row.status] ?? 'Working';
        const isDone = row.status === 'done' && !!row.tripId;
        return (
          <View
            key={row._id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 12,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: dark ? '#2A2A2A' : '#E5E7EB',
              backgroundColor: dark ? 'rgba(255,31,140,0.08)' : '#FFF1F8',
            }}>
            <TouchableOpacity
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={
                isDone ? 'Open your new trip' : 'See import progress'
              }
              onPress={() => {
                if (isDone && row.tripId) {
                  router.push(`/(tabs)/(trips)/${row.tripId}` as never);
                } else {
                  router.push({
                    pathname: '/create-trip-from-link',
                    params: { importId: row._id },
                  });
                }
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                flex: 1,
              }}>
              {isDone ? (
                <Sparkles size={18} color="#FF1F8C" />
              ) : (
                <Loader2 size={18} color="#FF1F8C" />
              )}
              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: dark ? '#fff' : '#111',
                  }}>
                  {labelBase}
                  {row.videoTitle ? ` · ${row.videoTitle}` : ''}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: dark ? '#9CA3AF' : '#6B7280',
                    marginTop: 1,
                  }}>
                  {isDone
                    ? 'Tap to open your new trip'
                    : 'Importing from a link — tap to see progress'}
                </Text>
              </View>
              <ChevronRight size={16} color={dark ? '#6B7280' : '#9CA3AF'} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDismiss(row._id)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Dismiss this import"
              style={{
                marginLeft: 6,
                width: 28,
                height: 28,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <X size={14} color={dark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}
