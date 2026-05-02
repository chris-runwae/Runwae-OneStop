import { ScrollView, ScrollViewProps, StyleSheet, View } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollView?: boolean;
  scrollViewProps?: ScrollViewProps;
}

const ScreenContainer = ({ children, scrollView = false, scrollViewProps }: ScreenContainerProps) => {
  const insets = useSafeAreaInsets();
  const ScrollViewComponent = scrollView ? ScrollView : View;

  const content = scrollView ? (
    <ScrollViewComponent {...scrollViewProps}>
      {children}
    </ScrollViewComponent>
  ) : (
    children
  );
  
  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom, paddingHorizontal: 16 }}>
      {content}
    </View>
  );
};

export default ScreenContainer;

const styles = StyleSheet.create({});
