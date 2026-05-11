export const SUPPORTED_LOCALES = [
  "en-GB",
  "en-US",
  "fr-FR",
  "es-MX",
  "es-ES",
  "pt-BR",
  "it-IT",
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const SOURCE_LOCALE: SupportedLocale = "en-GB";
export const FALLBACK_LOCALE: SupportedLocale = "en-GB";

export const LOCALE_NATIVE_NAMES: Record<SupportedLocale, string> = {
  "en-GB": "English (UK)",
  "en-US": "English (US)",
  "fr-FR": "Français",
  "es-MX": "Español (México)",
  "es-ES": "Español (España)",
  "pt-BR": "Português (Brasil)",
  "it-IT": "Italiano",
};

// Resolve a device locale string (e.g. "en", "en_GB", "pt-br", "fr-CA") to a
// supported locale. Falls back to FALLBACK_LOCALE if no reasonable match.
export function resolveLocale(input: string | null | undefined): SupportedLocale {
  if (!input) return FALLBACK_LOCALE;
  const normalised = input.replace("_", "-").toLowerCase();

  // Exact match (case-insensitive)
  for (const supported of SUPPORTED_LOCALES) {
    if (supported.toLowerCase() === normalised) return supported;
  }

  // Language-only match: pick the closest regional variant we ship.
  const lang = normalised.split("-")[0];
  switch (lang) {
    case "en":
      return "en-GB";
    case "fr":
      return "fr-FR";
    case "es":
      // Prefer es-ES for European devices, es-MX for LATAM hints.
      if (normalised.includes("mx") || normalised.includes("ar") || normalised.includes("co") || normalised.includes("cl") || normalised.includes("pe")) {
        return "es-MX";
      }
      return "es-ES";
    case "pt":
      return "pt-BR";
    case "it":
      return "it-IT";
    default:
      return FALLBACK_LOCALE;
  }
}
