import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import RadioOptions from "@/components/ui/RadioOptions";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useColorScheme } from "nativewind";
import React from "react";
import { View } from "react-native";
import { saveThemePreference, ThemePreference } from "@/utils/storage";

const Appearance = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [selectedTheme, setSelectedTheme] = React.useState<ThemePreference>(
    (colorScheme as ThemePreference) || "system"
  );

  React.useEffect(() => {
    if (colorScheme) {
      setSelectedTheme(colorScheme as any);
    } else {
      setColorScheme("system");
      setSelectedTheme("system");
    }
  }, []);

  const themes = [
    {
      label: "Device Settings",
      value: "system",
      subtitle: "Use device default mode.",
    },
    { label: "Light", value: "light", subtitle: "Always use light mode" },
    { label: "Dark", value: "dark", subtitle: "Always use dark mode" },
  ];

  const handleThemeChange = (theme: ThemePreference) => {
    setSelectedTheme(theme);
    setColorScheme(theme);
    saveThemePreference(theme);
  };

  return (
    <AppSafeAreaView>
      <ScreenHeader title="Appearance" />

      <View className="mt-5 px-[20px]">
        {themes.map((theme) => (
          <RadioOptions
            key={theme.value}
            title={theme.label}
            subtitle={theme.subtitle}
            selected={selectedTheme === theme.value}
            onPress={() => handleThemeChange(theme.value as any)}
          />
        ))}
      </View>
    </AppSafeAreaView>
  );
};

export default Appearance;
