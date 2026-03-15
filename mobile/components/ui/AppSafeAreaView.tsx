import React from "react";
import { SafeAreaView, type SafeAreaViewProps } from "react-native-safe-area-context";

interface AppSafeAreaViewProps extends SafeAreaViewProps {
  className?: string;
  children: React.ReactNode;
}

const AppSafeAreaView: React.FC<AppSafeAreaViewProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <SafeAreaView
      className={`flex-1 bg-white dark:bg-black ${className}`}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
};

export default AppSafeAreaView;
