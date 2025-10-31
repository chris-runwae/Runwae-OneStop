import Animated from "react-native-reanimated";

export function HelloWave({ size = 28 }: { size?: number }) {
  return (
    <Animated.Text
      style={{
        fontSize: size,
        lineHeight: size + 4,
        marginTop: -size / 4,
        animationName: {
          "50%": { transform: [{ rotate: "25deg" }] },
        },
        animationIterationCount: 4,
        animationDuration: "300ms",
      }}
    >
      👋
    </Animated.Text>
  );
}
