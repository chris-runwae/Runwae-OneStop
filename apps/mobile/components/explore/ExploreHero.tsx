import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { ImageBackground } from 'expo-image';
import { ArrowRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import { GlassView } from 'expo-glass-effect';

import type { Destination } from '@/types/content.types';
import Text from '@/components/ui/Text';
import { AppFonts, Colors, COLORS } from '@/constants';

interface ExploreHeroProps {
  destination: Destination;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200';

const ExploreHero = ({ destination }: ExploreHeroProps) => {
  type ColorScheme = keyof typeof Colors;
  const colorScheme = (useColorScheme() ?? 'light') as ColorScheme;
  const colors = Colors[colorScheme];
  return (
    <Link href={`/destination/${destination.id}`} asChild>
      <Link.AppleZoom>
        <Pressable
          // className="mx-5 mt-4 overflow-hidden rounded-2xl"
          style={styles.container}>
          <ImageBackground
            source={{ uri: destination.image || FALLBACK_IMAGE }}
            contentFit="cover"
            style={styles.imageContainer}>
            <LinearGradient
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ position: 'absolute', inset: 0 }}
            />

            <View style={styles.textContainer}>
              <View>
                <Text style={[styles.headerText]}>{destination.title}</Text>
                {destination.location ? (
                  <Text style={[styles.subText]}>{destination.location}</Text>
                ) : null}
              </View>

              <GlassView style={styles.glassView} isInteractive>
                <Text
                  style={[
                    styles.exploreText,
                    { color: colors.backgroundColors.default },
                  ]}>
                  Explore
                </Text>
                <ArrowRight
                  size={14}
                  color={colors.backgroundColors.default}
                  strokeWidth={2.4}
                />
              </GlassView>
            </View>
          </ImageBackground>
        </Pressable>
      </Link.AppleZoom>
    </Link>
  );
};

export default ExploreHero;

const styles = StyleSheet.create({
  container: {
    height: 450,
    width: '90%',
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 16,
    marginTop: 12,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 0,
  },
  glassView: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 99,
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 2,
  },
  headerText: {
    paddingTop: 12,
    fontSize: 24,
    fontFamily: AppFonts.bricolage.bold,
    color: COLORS.white.base,
  },
  exploreText: {
    fontSize: 14,
    fontFamily: AppFonts.bricolage.semiBold,
    color: COLORS.white.base,
  },
  subText: {
    fontSize: 14,
    fontFamily: AppFonts.bricolage.regular,
    color: COLORS.white.base,
  },
});
