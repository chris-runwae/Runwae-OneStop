import React from "react";
import { Text, View } from "react-native";

export const toastConfig = {
  success: (props: { text1: string; text2?: string }) => (
    <View className="bg-green-500 p-4 rounded-[20px] flex-1">
      <Text className="text-white font-bold">{props.text1}</Text>
      {props.text2 && <Text className="text-white mt-1">{props.text2}</Text>}
    </View>
  ),

  error: (props: { text1: string; text2?: string }) => (
    <View className="bg-red-500 p-4 rounded-[20px] flex-1">
      <Text className="text-white font-bold">{props.text1}</Text>
      {props.text2 && <Text className="text-white mt-1">{props.text2}</Text>}
    </View>
  ),

  info: (props: { text1: string; text2?: string }) => (
    <View className="bg-blue-500 p-4 rounded-[20px] flex-1">
      <Text className="text-white font-bold">{props.text1}</Text>
      {props.text2 && <Text className="text-white mt-1">{props.text2}</Text>}
    </View>
  ),

  warning: (props: { text1: string; text2?: string }) => (
    <View className="bg-yellow-500 p-4 rounded-[20px] flex-1">
      <Text className="text-white font-bold">{props.text1}</Text>
      {props.text2 && <Text className="text-white mt-1">{props.text2}</Text>}
    </View>
  ),
};
