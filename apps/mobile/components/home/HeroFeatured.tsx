import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight, Calendar, MapPin } from 'lucide-react-native';
import React, { useEffect } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const HERO_IMAGE = 'https://picsum.photos/seed/lisbon-tram-runwae/1200/675';
const SEED_DESTINATION = 'Lisbon, Portugal';

const HERO_SOURCE = { uri: HERO_IMAGE };

const HeroFeatured = () => {
  const router = useRouter();

  const handlePlanTrip = () => {
    router.push({
      pathname: '/create-trip-options',
      params: { seedDestination: SEED_DESTINATION },
    } as any);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Image
          source={HERO_SOURCE}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={250}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.8)']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.badge}>
          <PingDot />
          <Text style={styles.badgeText}>Trending now</Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.bottomTextCol}>
            <Text
              numberOfLines={1}
              style={styles.title}>
              Lisbon in Spring
            </Text>
            <View style={styles.pillRow}>
              <Pill icon={<Calendar size={11} color="#fff" strokeWidth={2.2} />}>
                Apr 18 — 24
              </Pill>
              <Pill icon={<MapPin size={11} color="#fff" strokeWidth={2.2} />}>
                Portugal
              </Pill>
            </View>
          </View>

          <Pressable
            onPress={handlePlanTrip}
            style={({ pressed }) => [
              styles.cta,
              pressed && { transform: [{ scale: 0.97 }] },
            ]}>
            <Text style={styles.ctaText}>Plan a trip</Text>
            <ArrowRight size={14} color="#fff" strokeWidth={2.4} />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const Pill = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <View style={styles.pill}>
    {icon}
    <Text style={styles.pillText}>{children}</Text>
  </View>
);

// Two staggered concentric rings expanding outward from the dot, like a GPS
// location ping. The solid dot stays put; rings scale + fade.
const PingDot = () => {
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);

  useEffect(() => {
    const opts = { duration: 1800, easing: Easing.out(Easing.quad) } as const;
    ring1.value = withRepeat(withTiming(1, opts), -1, false);
    ring2.value = withDelay(900, withRepeat(withTiming(1, opts), -1, false));
    return () => {
      cancelAnimation(ring1);
      cancelAnimation(ring2);
    };
  }, [ring1, ring2]);

  const r1Style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + ring1.value * 4 }],
    opacity: 0.55 * (1 - ring1.value),
  }));
  const r2Style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + ring2.value * 4 }],
    opacity: 0.55 * (1 - ring2.value),
  }));

  return (
    <View style={styles.dotWrap}>
      <Animated.View style={[styles.ring, r1Style]} />
      <Animated.View style={[styles.ring, r2Style]} />
      <View style={styles.badgeDot} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 4 },
    }),
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  dotWrap: {
    width: 6,
    height: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF2E92',
  },
  ring: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF2E92',
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0F0F0F',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  bottomRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  bottomTextCol: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 26,
    fontFamily: 'BricolageGrotesque-ExtraBold',
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
    lineHeight: 28,
  },
  pillRow: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  pillText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#fff',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: '#FF2E92',
    ...Platform.select({
      ios: {
        shadowColor: '#FF2E92',
        shadowOpacity: 0.45,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 6 },
    }),
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
  },
});

export default HeroFeatured;
