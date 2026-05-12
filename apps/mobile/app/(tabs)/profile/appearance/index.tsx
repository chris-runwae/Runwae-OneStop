import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import RadioOptions from "@/components/ui/RadioOptions";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useColorScheme } from "nativewind";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useMutation } from "convex/react";
import { api } from "@runwae/convex/convex/_generated/api";
import { saveThemePreference, ThemePreference } from "@/utils/storage";
import {
  LOCALE_NATIVE_NAMES,
  SUPPORTED_LOCALES,
  i18next,
  resolveLocale,
  type SupportedLocale,
} from "@/lib/i18n";

const Appearance = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [selectedTheme, setSelectedTheme] = React.useState<ThemePreference>(
    (colorScheme as ThemePreference) || "system"
  );
  const { i18n } = useTranslation();
  const setLocale = useMutation(api.users.setLocale);

  // i18n.language might briefly be in a non-canonical form during a
  // change transition; resolveLocale narrows it to the matching supported
  // locale so the radio selection stays consistent with what's actually
  // active in i18next.
  const activeLocale: SupportedLocale = resolveLocale(i18n.language);

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

  const handleLocaleChange = async (locale: SupportedLocale) => {
    // Update i18next first so the UI reflects the change instantly,
    // even before the Convex round-trip completes. If the mutation
    // fails (network blip), the next LocaleSync read from server
    // will reconcile us back.
    await i18next.changeLanguage(locale);
    try {
      await setLocale({ locale });
    } catch (err) {
      // Best-effort persistence — keep local change applied. Convex
      // surfaces auth/validation errors through ErrorBoundary in a
      // proper screen; here we just log so the picker stays usable.
      console.warn("[appearance] setLocale failed", err);
    }
  };

  return (
    <AppSafeAreaView>
      <ScreenHeader title="Appearance" />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="mt-5 px-[20px]">
          <Text className="mb-2 text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
            Theme
          </Text>
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

        <View className="mt-8 px-[20px]">
          <Text className="mb-2 text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
            Language
          </Text>
          <Text className="mb-3 text-xs text-gray-500 dark:text-gray-400">
            Translations are machine-generated and in beta. App copy stays in
            source language until the next release.
          </Text>
          {SUPPORTED_LOCALES.map((locale) => (
            <RadioOptions
              key={locale}
              title={LOCALE_NATIVE_NAMES[locale]}
              subtitle={locale}
              selected={activeLocale === locale}
              onPress={() => {
                void handleLocaleChange(locale);
              }}
            />
          ))}
        </View>
      </ScrollView>
    </AppSafeAreaView>
  );
};

export default Appearance;
