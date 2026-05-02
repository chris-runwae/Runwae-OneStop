import React from "react";
import Svg, { Defs, Image, Pattern, Rect } from "react-native-svg";

const SplashScreenLogo = ({
  width = 40,
  height = 57,
}: {
  width?: number;
  height?: number;
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 40 57" fill="none">
      <Rect width="40" height="56.1074" fill="url(#pattern0_481_5474)" />
      <Defs>
        <Pattern
          id="pattern0_481_5474"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <Image
            href="data:image/png;base64,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"
            x="0"
            y="0"
            width="149"
            height="209"
            preserveAspectRatio="xMidYMid slice"
          />
        </Pattern>
      </Defs>
    </Svg>
  );
};

export default SplashScreenLogo;
