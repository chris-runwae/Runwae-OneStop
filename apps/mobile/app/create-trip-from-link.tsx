import LinkBuildingStep from '@/components/ai-trip/LinkBuildingStep';
import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import {
  useGenerateTripFromUrl,
  useMyActiveImports,
} from '@/hooks/useAiTripActions';
import { useTheme } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, AlertCircle } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Reason =
  | 'not_authenticated'
  | 'quota_exhausted'
  | 'unsupported_platform'
  | 'video_too_long'
  | 'transcript_unavailable'
  | 'transcript_empty'
  | 'extractor_unreachable'
  | 'ai_failed';

const FRIENDLY_ERROR: Record<Reason, string> = {
  not_authenticated: 'Please sign in to import trips from links.',
  quota_exhausted: "You've used all your AI trip credits.",
  unsupported_platform: 'Only YouTube and TikTok links are supported.',
  video_too_long:
    'This video is over 20 minutes — too long to import. Try a shorter one.',
  transcript_unavailable: "We couldn't read this video. Try another link.",
  transcript_empty: 'The transcript came back empty. Try another video.',
  extractor_unreachable:
    "We couldn't reach the video extractor. Please retry.",
  ai_failed: "We couldn't draft an itinerary from this video.",
};

const STATUS_TO_STAGE: Record<string, number> = {
  queued: 0,
  extracting: 0,
  transcribing: 1,
  planning: 2,
  materializing: 3,
  done: 3,
  failed: 0,
};

export default function CreateTripFromLink() {
  const { dark } = useTheme();
  const params = useLocalSearchParams<{
    url?: string;
    title?: string;
    image?: string;
    idempotencyKey?: string;
    importId?: string;
  }>();

  const generate = useGenerateTripFromUrl();
  const imports = useMyActiveImports();

  const [stage, setStage] = useState(0);
  const [errorReason, setErrorReason] = useState<Reason | null>(null);
  const [resumedImportId, setResumedImportId] = useState<string | null>(
    params.importId ?? null,
  );
  const calledRef = useRef(false);

  // First-mount call — only fire once even under StrictMode double-render.
  useEffect(() => {
    if (calledRef.current) return;
    if (params.importId) return; // resumed run — subscribe-only mode
    if (!params.url) return;
    calledRef.current = true;

    (async () => {
      try {
        const res = await generate({
          url: params.url!,
          idempotencyKey: params.idempotencyKey,
          title: params.title || undefined,
          coverImageUrl: params.image || undefined,
        });
        if (!res.ok) {
          setErrorReason(res.reason);
          return;
        }
        if (res.mode === 'inline') {
          // Trip ready: jump straight in. Typed-routes doesn't know about
          // the (tabs)/(trips) group, so cast — same pattern TripCard uses.
          router.replace(`/(tabs)/(trips)/${res.tripId}` as never);
          return;
        }
        // Background mode: subscribe to media_imports for this importId.
        setResumedImportId(res.importId);
      } catch (err) {
        Alert.alert(
          'Trip import failed',
          err instanceof Error ? err.message : 'Please try again.',
        );
        setErrorReason('ai_failed');
      }
    })();
  }, [generate, params.url, params.idempotencyKey, params.title, params.image, params.importId]);

  const current = useMemo(() => {
    if (!resumedImportId) return null;
    return imports?.find((r) => r._id === resumedImportId) ?? null;
  }, [imports, resumedImportId]);

  // Advance the visual stage when the server moves through statuses.
  useEffect(() => {
    if (!current) return;
    const next = STATUS_TO_STAGE[current.status] ?? 0;
    setStage((prev) => Math.max(prev, next));
    if (current.status === 'done' && current.tripId) {
      router.replace(`/(tabs)/(trips)/${current.tripId}` as never);
    }
    if (current.status === 'failed') {
      setErrorReason(
        ((current.errorReason as Reason | undefined) ?? 'ai_failed') as Reason,
      );
    }
  }, [current]);

  if (errorReason) {
    return (
      <AppSafeAreaView edges={['top']} className="flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <AlertCircle size={42} color="#FF1F8C" />
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              marginTop: 14,
              color: dark ? '#fff' : '#111',
              textAlign: 'center',
            }}>
            We couldn&apos;t build your trip
          </Text>
          <Text
            style={{
              fontSize: 14,
              marginTop: 8,
              color: dark ? '#9CA3AF' : '#6B7280',
              textAlign: 'center',
            }}>
            {FRIENDLY_ERROR[errorReason]}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              marginTop: 28,
              backgroundColor: '#FF1F8C',
              paddingHorizontal: 28,
              paddingVertical: 12,
              borderRadius: 999,
            }}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
              Try another link
            </Text>
          </TouchableOpacity>
        </View>
      </AppSafeAreaView>
    );
  }

  return (
    <AppSafeAreaView edges={['top']} className="flex-1">
      <View
        className="flex-row items-center justify-between px-4 pt-2 pb-3"
        style={{ height: 48 }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          className="h-9 w-9 items-center justify-center">
          <ArrowLeft size={20} color={dark ? '#fff' : '#000'} />
        </Pressable>
        <Text
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: dark ? '#fff' : '#000',
          }}>
          Importing trip
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {!resumedImportId && imports === undefined ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#FF1F8C" />
        </View>
      ) : (
        <LinkBuildingStep
          width={SCREEN_WIDTH}
          stage={stage}
          videoTitle={params.title || current?.videoTitle || undefined}
        />
      )}

      {resumedImportId && !current?.tripId ? (
        <View className="px-7 pb-8">
          <Text
            style={{
              fontSize: 12,
              color: dark ? '#9CA3AF' : '#6B7280',
              textAlign: 'center',
            }}>
            This video is longer than usual — we&apos;ll keep working in the
            background. You can leave this screen and we&apos;ll notify you
            when it&apos;s ready.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            style={{
              marginTop: 14,
              alignSelf: 'center',
              paddingHorizontal: 22,
              paddingVertical: 10,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: dark ? '#2A2A2A' : '#E5E7EB',
            }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: dark ? '#fff' : '#111',
              }}>
              Continue in background
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </AppSafeAreaView>
  );
}
