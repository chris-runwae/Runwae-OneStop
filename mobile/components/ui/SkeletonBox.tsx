import { useTheme } from "@react-navigation/native";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";

const SkeletonBox = ({
  width,
  height,
  borderRadius = 8,
}: {
  width: number;
  height: number;
  borderRadius?: number;
}) => {
  const opacity = useRef(new Animated.Value(0.4)).current;
  const { dark } = useTheme();

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: dark ? "#212529" : "#E5E7EB",
        opacity,
      }}
    />
  );
};

export default SkeletonBox;
