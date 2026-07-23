import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { router } from 'expo-router';

import ExploreHero from './ExploreHero';
import type { Destination } from '@/types/content.types';

const SPRING = { damping: 26, stiffness: 380, mass: 1 } as const;
const THRESHOLD = 80;
const EXIT_PX = 800;
const PROGRESS_RANGE = 160;

const PEEK_ROOM = 48;
const STACK = [
  { y: 0, scale: 1 },
  { y: -22, scale: 0.935 },
  { y: -48, scale: 0.87 },
] as const;

interface Props {
  destinations: Destination[];
}

export default function ExploreHeroStack({ destinations }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const dragY = useSharedValue(0);
  const locked = useSharedValue(false);

  const count = destinations.length;
  const dest = (offset: number) =>
    destinations[((activeIndex + offset) % count + count) % count];

  const advance = useCallback(
    (dir: 1 | -1) => setActiveIndex(i => ((i + dir) % count + count) % count),
    [count],
  );

  // Navigate to the current front card's destination screen
  const navigateFront = useCallback(() => {
    const current = destinations[activeIndex];
    if (current) router.push(`/destination/${current.id}` as any);
  }, [destinations, activeIndex]);

  const pan = Gesture.Pan()
    .activeOffsetY([-8, 8])
    .onUpdate(e => {
      if (!locked.value) dragY.value = e.translationY;
    })
    .onEnd(e => {
      if (locked.value) return;
      const goNext = e.translationY < -THRESHOLD || e.velocityY < -600;
      const goPrev = e.translationY > THRESHOLD || e.velocityY > 600;

      if (goNext || goPrev) {
        locked.value = true;
        const dir = goNext ? 1 : -1;
        dragY.value = withSpring(goNext ? -EXIT_PX : EXIT_PX, SPRING, () => {
          runOnJS(advance)(dir);
          dragY.value = 0;
          locked.value = false;
        });
      } else {
        dragY.value = withSpring(0, SPRING);
      }
    });

  // Tap gesture handles front-card navigation.
  // Gesture.Race(pan, tap): first to recognise wins and cancels the other.
  // Pan wins on any 8px vertical movement (swipe), tap wins on clean finger-up.
  // This prevents ExploreHero's own Link from ever double-firing.
  const tap = Gesture.Tap()
    .maxDuration(400)
    .onEnd((_e, success) => {
      if (success && !locked.value) runOnJS(navigateFront)();
    });

  const gesture = Gesture.Race(pan, tap);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dragY.value }, { scale: 1 }],
    zIndex: 3,
  }));

  const midStyle = useAnimatedStyle(() => {
    const p = Math.min(Math.abs(dragY.value) / PROGRESS_RANGE, 1);
    return {
      transform: [
        { translateY: interpolate(p, [0, 1], [STACK[1].y, STACK[0].y], Extrapolation.CLAMP) },
        { scale: interpolate(p, [0, 1], [STACK[1].scale, STACK[0].scale], Extrapolation.CLAMP) },
      ],
      zIndex: 2,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const p = Math.min(Math.abs(dragY.value) / PROGRESS_RANGE, 1);
    return {
      transform: [
        { translateY: interpolate(p, [0, 1], [STACK[2].y, STACK[1].y], Extrapolation.CLAMP) },
        { scale: interpolate(p, [0, 1], [STACK[2].scale, STACK[1].scale], Extrapolation.CLAMP) },
      ],
      zIndex: 1,
    };
  });

  if (count < 1) return null;
  if (count < 3) return <ExploreHero destination={destinations[0]} />;

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.container}>
        <Animated.View style={[styles.card, backStyle]}>
          <ExploreHero destination={dest(2)} />
        </Animated.View>
        <Animated.View style={[styles.card, midStyle]}>
          <ExploreHero destination={dest(1)} />
        </Animated.View>
        <Animated.View style={[styles.card, frontStyle]}>
          <ExploreHero destination={dest(0)} />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    height: PEEK_ROOM + 12 + 450,
    width: '100%',
  },
  card: {
    position: 'absolute',
    top: PEEK_ROOM,
    left: 0,
    right: 0,
  },
});
