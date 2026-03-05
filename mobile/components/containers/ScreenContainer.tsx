import { ScrollView, ScrollViewProps, StyleSheet, View } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants";

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollView?: boolean;
  scrollViewProps?: ScrollViewProps;
}

const ScreenContainer = ({ children, scrollView = false, scrollViewProps }: ScreenContainerProps) => {
  const insets = useSafeAreaInsets();

  if (scrollView) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: Colors.light.background }} contentContainerStyle={{ paddingBottom: 100, flex: 1, paddingHorizontal: 16, paddingTop: insets.top }} {...scrollViewProps}>
      {children}
    </ScrollView>
  );
  }
  
  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom, paddingHorizontal: 16 }}>
      {children}
    </View>
  );
};

export default ScreenContainer;

const styles = StyleSheet.create({});
