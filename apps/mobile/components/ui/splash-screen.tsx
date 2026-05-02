import React from "react";
import { Image, View } from "react-native";

const SplashScreen = () => {
  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <View className="w-[50px] h-[50px] items-center justify-center">
        <Image
          source={require("@/assets/images/splash-logo.png")}
          style={{ width: 40, height: 57, resizeMode: "contain" }}
        />
      </View>
    </View>
  );
};

export default SplashScreen;
