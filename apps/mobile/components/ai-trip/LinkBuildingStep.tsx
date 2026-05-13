import { Text } from '@/components';
import { AppFonts, Colors } from '@/constants';
import { Check, Sparkles } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const STAGES = [
  'Reading the link',
  'Watching the video',
  'Drafting your itinerary',
  'Adding photos & maps',
] as const;

type Props = {
  width: number;
  /** 0..3 — drives which row is "active" (spinning) and which are "done". */
  stage: number;
  videoTitle?: string;
};

// Sibling of AiBuildingStep but driven by an EXTERNAL stage prop so the
// orchestrator (server status updates over Convex subscription) controls
// the progression. The free-form AiBuildingStep advances on a timer
// because it has nothing to subscribe to — for trip-from-link we always
// have a media_imports row updating in real time.
const LinkBuildingStep = ({ width, stage, videoTitle }: Props) => {
  const dark = useColorScheme() === 'dark';
  const colors = Colors[dark ? 'dark' : 'light'];

  const rotation = useSharedValue(0);
  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 900, easing: Easing.linear }),
      -1,
    );
  }, [rotation]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[styles.container, { width }]}>
      <Animated.View entering={FadeIn.duration(280)} style={styles.iconWrap}>
        <View
          style={[
            styles.ringStatic,
            { borderColor: dark ? '#2C2C2E' : '#FFE4F0' },
          ]}
        />
        <Animated.View
          style={[styles.ring, ringStyle, { borderTopColor: '#FF1F8C' }]}
        />
        <View style={styles.sparkleInner}>
          <Sparkles size={28} color="#FF1F8C" strokeWidth={2.2} />
        </View>
      </Animated.View>

      <Text style={[styles.title, { color: colors.textColors.default }]}>
        Building your itinerary…
      </Text>
      <Text style={[styles.subtitle, { color: colors.textColors.subtle }]}>
        {videoTitle
          ? `Reading "${videoTitle.slice(0, 60)}${
              videoTitle.length > 60 ? '…' : ''
            }"`
          : 'This usually takes a few seconds.'}
      </Text>

      <View style={styles.stagesList}>
        {STAGES.map((label, i) => {
          const done = i < stage;
          const active = i === stage;
          return (
            <View key={label} style={styles.stageRow}>
              <View
                style={[
                  styles.stageDot,
                  done
                    ? styles.stageDotDone
                    : active
                      ? styles.stageDotActive
                      : { backgroundColor: dark ? '#374151' : '#E5E7EB' },
                ]}>
                {done ? (
                  <Animated.View entering={FadeIn.duration(200)}>
                    <Check size={12} color="#fff" strokeWidth={3} />
                  </Animated.View>
                ) : null}
              </View>
              <Text
                style={[
                  styles.stageLabel,
                  {
                    color:
                      done || active
                        ? colors.textColors.default
                        : colors.textColors.subtle,
                  },
                ]}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default LinkBuildingStep;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  ringStatic: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
  },
  ring: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  sparkleInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,31,140,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: AppFonts.bricolage.semiBold,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: AppFonts.inter.regular,
    marginBottom: 32,
    textAlign: 'center',
  },
  stagesList: { width: '100%', gap: 12 },
  stageRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stageDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageDotDone: { backgroundColor: '#FF1F8C' },
  stageDotActive: { backgroundColor: '#FF1F8C', opacity: 0.5 },
  stageLabel: {
    fontSize: 14,
    fontFamily: AppFonts.inter.regular,
  },
});
