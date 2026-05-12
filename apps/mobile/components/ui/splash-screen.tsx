import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, View } from "react-native";

/**
 * In-app splash shown while auth state hydrates and the viewer query
 * resolves after sign-in. Background and icon match the OS splash
 * (configured in app.config.ts -> expo-splash-screen plugin) so the
 * cold-launch -> JS-takeover -> auth-loading transition feels like
 * one continuous frame instead of three different screens.
 *
 * Animation is intentionally subtle: the icon eases up to full size
 * on mount and pulses gently while waiting. Long waits (>2s) start a
 * soft radiating ring so the user knows we're still alive.
 */
const SplashScreen = () => {
  const iconScale = useRef(new Animated.Value(0.85)).current;
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial entrance: icon scales from 85% to 100% in 320ms.
    const entrance = Animated.timing(iconScale, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    // After entrance, gentle pulse: 100% -> 105% -> 100%, 1.6s loop.
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(iconScale, {
          toValue: 1.05,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(iconScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    // After 2s of waiting, start the ring radiating to signal we
    // haven't frozen. Loops forever; fades out automatically when the
    // splash unmounts.
    const ringDelay = setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 2.4,
            duration: 1800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(ringOpacity, {
              toValue: 0.35,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacity, {
              toValue: 0,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    }, 2000);

    Animated.sequence([entrance, pulse]).start();

    return () => {
      clearTimeout(ringDelay);
      iconScale.stopAnimation();
      ringScale.stopAnimation();
      ringOpacity.stopAnimation();
    };
  }, [iconScale, ringScale, ringOpacity]);

  return (
    <View className="flex-1 items-center justify-center bg-black">
      <View
        style={{
          width: 80,
          height: 80,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={{
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: 40,
            borderWidth: 1,
            borderColor: "#ffffff",
            transform: [{ scale: ringScale }],
            opacity: ringOpacity,
          }}
        />
        <Animated.View style={{ transform: [{ scale: iconScale }] }}>
          <Image
            source={require("@/assets/images/splash-icon.png")}
            style={{ width: 56, height: 56, resizeMode: "contain" }}
          />
        </Animated.View>
      </View>
    </View>
  );
};

export default SplashScreen;
