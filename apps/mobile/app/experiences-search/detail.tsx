import SkeletonBox from '@/components/ui/SkeletonBox';
import { Colors, textStyles } from '@/constants';
import { shareEntity } from '@/lib/shareEntity';
import { api } from '@runwae/convex/convex/_generated/api';
import { FlashList } from '@shopify/flash-list';
import { useAction } from 'convex/react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Share2,
  Sparkles,
  Star,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80';

type Provider =
  | 'viator'
  | 'tiqets'
  | 'yelp'
  | 'ticketmaster'
  | 'geoapify'
  | 'static'
  | 'liteapi'
  | 'duffel'
  | 'rentalcars';

type DiscoveryDetail = {
  provider: Provider;
  apiRef: string;
  category: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  externalUrl?: string;
  locationName?: string;
  rating?: number;
  gallery?: string[];
  highlights?: string[];
  amenities?: string[];
  duration?: string;
  address?: string;
  reviewCount?: number;
};

const PROVIDER_LABELS: Partial<Record<Provider, string>> = {
  viator: 'Viator',
  tiqets: 'Tiqets',
  ticketmaster: 'Ticketmaster',
  yelp: 'OpenTable',
  geoapify: 'Geoapify',
};

export default function ExperienceDetailScreen() {
  const params = useLocalSearchParams<{
    provider: string;
    apiRef: string;
    category: string;
    title?: string;
    imageUrl?: string;
    externalUrl?: string;
  }>();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const getDetail = useAction(api.discovery.getDetail);

  const [detail, setDetail] = useState<DiscoveryDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  const fetchDetail = useCallback(async () => {
    setError(null);
    setDetail(null);
    try {
      const data = (await getDetail({
        provider: params.provider,
        apiRef: params.apiRef,
        category: params.category,
      })) as DiscoveryDetail | null;
      if (!data) {
        setError('Couldn’t load this experience.');
        return;
      }
      setDetail(data);
    } catch (err) {
      setError((err as Error).message ?? 'Couldn’t load this experience.');
    }
  }, [getDetail, params.provider, params.apiRef, params.category]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const galleryImages = useMemo(() => {
    if (detail?.gallery?.length) return detail.gallery.slice(0, 8);
    if (detail?.imageUrl) return [detail.imageUrl];
    if (params.imageUrl) return [params.imageUrl];
    return [];
  }, [detail, params.imageUrl]);

  const externalUrl = detail?.externalUrl ?? params.externalUrl;

  const handleShare = useCallback(async () => {
    try {
      await shareEntity({
        kind: 'experience',
        id: `${params.provider}_${params.apiRef}`,
        title: detail?.title ?? params.title ?? 'Experience',
        subtitle: detail?.locationName,
        query: { provider: params.provider, ref: params.apiRef },
      });
    } catch {
      // dismissed
    }
  }, [detail, params]);

  const handleOpenExternal = useCallback(() => {
    if (!externalUrl) return;
    Linking.openURL(externalUrl).catch(() => {});
  }, [externalUrl]);

  const ctaLabel = `View on ${PROVIDER_LABELS[params.provider as Provider] ?? 'partner'}`;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.backgroundColors.default },
      ]}>
      {/* Gallery */}
      <View style={styles.gallery}>
        {galleryImages.length > 0 ? (
          <FlashList
            data={galleryImages}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
              );
              setImageIndex(idx);
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item || FALLBACK_IMAGE }}
                style={{ width: SCREEN_WIDTH, height: 280 }}
                contentFit="cover"
              />
            )}
          />
        ) : (
          <View
            style={{
              width: SCREEN_WIDTH,
              height: 280,
              backgroundColor: colors.backgroundColors.subtle,
            }}
          />
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0.45)', 'transparent']}
          style={styles.galleryTopGradient}
          pointerEvents="none"
        />

        <Pressable
          onPress={() => router.back()}
          style={[styles.headerCircle, styles.backBtn, { top: insets.top + 8 }]}>
          <ArrowLeft size={20} color="#fff" />
        </Pressable>
        <Pressable
          onPress={handleShare}
          style={[styles.headerCircle, styles.shareBtn, { top: insets.top + 8 }]}>
          <Share2 size={18} color="#fff" />
        </Pressable>

        {galleryImages.length > 1 ? (
          <View style={styles.dots}>
            {galleryImages.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i === imageIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                    width: i === imageIndex ? 16 : 6,
                  },
                ]}
              />
            ))}
          </View>
        ) : null}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}>
        <View style={styles.content}>
          <View style={styles.providerRow}>
            <Text style={styles.providerChip}>
              via {PROVIDER_LABELS[params.provider as Provider] ?? params.provider}
            </Text>
          </View>

          <Text
            style={[styles.title, { color: colors.textColors.default }]}>
            {detail?.title ?? params.title ?? 'Experience'}
          </Text>

          {detail?.locationName ? (
            <View style={styles.locationRow}>
              <MapPin size={13} color="#FF1F8C" />
              <Text
                style={[styles.address, { color: colors.textColors.subtle }]}
                numberOfLines={2}>
                {detail.address ?? detail.locationName}
              </Text>
            </View>
          ) : detail === null ? (
            <SkeletonBox width="50%" height={14} borderRadius={4} />
          ) : null}

          <View style={styles.metaRow}>
            {detail?.rating ? (
              <View style={styles.ratingBadge}>
                <Star size={14} color="#FFD700" fill="#FFD700" />
                <Text style={styles.ratingText}>
                  {detail.rating.toFixed(1)}
                </Text>
                {detail.reviewCount ? (
                  <Text style={styles.reviewCount}>
                    ({detail.reviewCount})
                  </Text>
                ) : null}
              </View>
            ) : null}
            {detail?.duration ? (
              <View
                style={[
                  styles.metaChip,
                  { borderColor: colors.borderColors.subtle },
                ]}>
                <Text
                  style={[
                    styles.metaText,
                    { color: colors.textColors.subtle },
                  ]}>
                  {detail.duration}
                </Text>
              </View>
            ) : null}
            {detail?.price ? (
              <Text
                style={[styles.price, { color: colors.textColors.default }]}>
                from {detail.currency ?? 'USD'} {Math.round(detail.price)}
              </Text>
            ) : null}
          </View>

          {detail?.highlights && detail.highlights.length > 0 ? (
            <>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: colors.textColors.default },
                ]}>
                Highlights
              </Text>
              <View style={{ gap: 8 }}>
                {detail.highlights.slice(0, 6).map((h, idx) => (
                  <View key={`${idx}-${h.slice(0, 12)}`} style={styles.bullet}>
                    <Sparkles size={14} color="#FF1F8C" />
                    <Text
                      style={[
                        styles.bulletText,
                        { color: colors.textColors.default },
                      ]}>
                      {h}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {detail?.description ? (
            <>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: colors.textColors.default },
                ]}>
                About
              </Text>
              <RenderHTML
                contentWidth={width - 32}
                source={{ html: detail.description }}
                baseStyle={{
                  color: colors.textColors.subtle,
                  ...textStyles.textBody14,
                  lineHeight: 22,
                } as any}
              />
            </>
          ) : detail === null ? (
            <View style={{ gap: 8 }}>
              <SkeletonBox width="100%" height={14} borderRadius={4} />
              <SkeletonBox width="90%" height={14} borderRadius={4} />
              <SkeletonBox width="70%" height={14} borderRadius={4} />
            </View>
          ) : null}

          {error ? (
            <Text style={[styles.errorText, { color: '#EF4444' }]}>
              {error}
            </Text>
          ) : null}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View
        style={[
          styles.cta,
          {
            paddingBottom: insets.bottom + 16,
            backgroundColor: colors.backgroundColors.default,
            borderTopColor: colors.borderColors.subtle,
          },
        ]}>
        <Pressable
          style={[
            styles.ctaBtn,
            !externalUrl && { opacity: 0.5 },
          ]}
          onPress={handleOpenExternal}
          disabled={!externalUrl}>
          <ExternalLink size={16} color="#fff" />
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  gallery: { position: 'relative' },
  galleryTopGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  headerCircle: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: { left: 16 },
  shareBtn: { right: 16 },
  dots: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: { height: 6, borderRadius: 3 },

  content: { paddingHorizontal: 16, paddingTop: 20, gap: 16 },
  providerRow: { flexDirection: 'row' },
  providerChip: {
    ...textStyles.textBody12,
    fontSize: 10,
    fontWeight: '700',
    color: '#FF1F8C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    ...textStyles.textHeading20,
    fontSize: 22,
    lineHeight: 28,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  address: { ...textStyles.textBody12, flex: 1 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF1F8C15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    ...textStyles.textHeading16,
    fontSize: 13,
    color: '#FF1F8C',
  },
  reviewCount: {
    ...textStyles.textBody12,
    fontSize: 11,
    color: '#FF1F8C',
  },
  metaChip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metaText: { ...textStyles.textBody12 },
  price: { ...textStyles.textHeading16, fontSize: 14 },
  sectionLabel: { ...textStyles.textHeading16, fontSize: 15 },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bulletText: { ...textStyles.textBody14, flex: 1 },
  errorText: { ...textStyles.textBody14, marginTop: 12 },

  cta: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  ctaBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FF1F8C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    ...textStyles.textHeading16,
    color: '#fff',
    fontSize: 15,
  },
});
