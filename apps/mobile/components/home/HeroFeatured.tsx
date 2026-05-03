import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight, Calendar, MapPin } from 'lucide-react-native';
import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const HERO_IMAGE = 'https://picsum.photos/seed/lisbon-tram-runwae/1200/675';
const SEED_DESTINATION = 'Lisbon, Portugal';

const HeroFeatured = () => {
  const router = useRouter();

  const handlePlanTrip = () => {
    router.push({
      pathname: '/create-trip',
      params: { seedDestination: SEED_DESTINATION },
    });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Image source={{ uri: HERO_IMAGE }} style={styles.image} />
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.8)']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.badge}>
          <View style={styles.badgeDot} />
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

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 14,
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
  badgeDot: {
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
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#FF2E92',
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
});

export default HeroFeatured;
