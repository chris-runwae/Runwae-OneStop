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

import ExploreHero from './ExploreHero';
import type { Destination } from '@/types/content.types';

// Apple UISpringTimingParameters — snappy, no bounce
const SPRING = { damping: 26, stiffness: 380, mass: 1 } as const;
const THRESHOLD = 80; // px of translationY before a swipe commits
const EXIT_PX = 800; // off-screen exit distance
const PROGRESS_RANGE = 160; // drag distance over which stack reveal completes

// Resting transforms per stack depth.
// y is relative to the card base (top: PEEK_ROOM), so negative values
// shift cards upward into the reserved peek space above the front card.
const PEEK_ROOM = 48; // px reserved above front card for back cards to show
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
    destinations[(((activeIndex + offset) % count) + count) % count];

  const advance = useCallback(
    (dir: 1 | -1) =>
      setActiveIndex((i) => (((i + dir) % count) + count) % count),
    [count]
  );

  const gesture = Gesture.Pan()
    // Activate once the user has moved 8px vertically — works for diagonals too
    .activeOffsetY([-8, 8])
    .onUpdate((e) => {
      if (!locked.value) dragY.value = e.translationY;
    })
    .onEnd((e) => {
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

  // Front card: follows the drag directly
  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dragY.value }, { scale: 1 }],
    zIndex: 3,
  }));

  // Middle card: advances toward front position as drag progresses
  const midStyle = useAnimatedStyle(() => {
    const p = Math.min(Math.abs(dragY.value) / PROGRESS_RANGE, 1);
    return {
      transform: [
        {
          translateY: interpolate(
            p,
            [0, 1],
            [STACK[1].y, STACK[0].y],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(
            p,
            [0, 1],
            [STACK[1].scale, STACK[0].scale],
            Extrapolation.CLAMP
          ),
        },
      ],
      zIndex: 2,
    };
  });

  // Back card: advances toward middle position as drag progresses
  const backStyle = useAnimatedStyle(() => {
    const p = Math.min(Math.abs(dragY.value) / PROGRESS_RANGE, 1);
    return {
      transform: [
        {
          translateY: interpolate(
            p,
            [0, 1],
            [STACK[2].y, STACK[1].y],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(
            p,
            [0, 1],
            [STACK[2].scale, STACK[1].scale],
            Extrapolation.CLAMP
          ),
        },
      ],
      zIndex: 1,
    };
  });

  if (count < 1) return null;
  if (count < 3) return <ExploreHero destination={destinations[0]} />;

  return (
    <GestureDetector gesture={gesture}>
      {/*
        PEEK_ROOM px at the top of the container is reserved space so that
        back cards peeking upward stay within the container and aren't
        clipped by the parent ScrollView. All cards use `top: PEEK_ROOM`
        as their base, and their negative translateY offsets move them into
        this reserved space.
      */}
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
  // Height = PEEK_ROOM + ExploreHero marginTop (12) + card height (450)
  container: {
    height: PEEK_ROOM + 12 + 450,
    width: '100%',
  },
  // All cards share the same base position; their animated styles apply
  // translateY offsets relative to this top.
  card: {
    position: 'absolute',
    top: PEEK_ROOM,
    left: 0,
    right: 0,
  },
});
