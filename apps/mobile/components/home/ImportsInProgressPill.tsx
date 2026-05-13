import { useMyActiveImports } from '@/hooks/useAiTripActions';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import { Loader2, Sparkles } from 'lucide-react-native';
import React from 'react';
import {
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

// Home-screen subscriber to media_imports. Renders nothing when there are
// no active imports. One pill per active import — the typical case is one
// at a time, but multiple stack vertically if a user kicks off several.
export default function ImportsInProgressPill() {
  const { dark } = useTheme();
  const imports = useMyActiveImports();
  if (!imports || imports.length === 0) return null;

  return (
    <View style={{ paddingHorizontal: 20, gap: 8 }}>
      {imports.map((row) => {
        const labelBase = STATUS_LABELS[row.status] ?? 'Working';
        const tappable = row.status === 'done' && row.slug;
        return (
          <TouchableOpacity
            key={row._id}
            disabled={!tappable && row.status !== 'done'}
            activeOpacity={tappable ? 0.7 : 1}
            onPress={() => {
              if (tappable && row.tripId) {
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
              padding: 12,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: dark ? '#2A2A2A' : '#E5E7EB',
              backgroundColor: dark ? 'rgba(255,31,140,0.08)' : '#FFF1F8',
            }}>
            {row.status === 'done' ? (
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
                {row.status === 'done'
                  ? 'Tap to open your new trip'
                  : 'Importing from a link — tap to see progress'}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
