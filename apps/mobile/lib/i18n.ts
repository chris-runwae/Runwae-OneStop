// Mobile i18n bootstrap. Owns the i18next singleton, locale resolution,
// and message-resource loading.
//
// Foundation only — string extraction across screens lands in Phase 6.5.
// The locale picker on Profile → Appearance → Language already works
// today and will swap formatters (Intl number/date) immediately; UI copy
// stays in source language until extraction lands.
//
// OTA-friendly: no native modules. Device locale comes from JS `Intl`
// rather than `expo-localization` so this can ship via `eas update`.

import "intl-pluralrules";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import {
  FALLBACK_LOCALE,
  LOCALE_NATIVE_NAMES,
  SUPPORTED_LOCALES,
  resolveLocale,
  type SupportedLocale,
} from "@runwae/i18n/locales";

import enGB from "@runwae/i18n/messages/en-GB.json";
import enUSOverrides from "@runwae/i18n/messages/en-US.overrides.json";
import frFR from "@runwae/i18n/messages/fr-FR.json";
import esMX from "@runwae/i18n/messages/es-MX.json";
import esES from "@runwae/i18n/messages/es-ES.json";
import ptBR from "@runwae/i18n/messages/pt-BR.json";
import itIT from "@runwae/i18n/messages/it-IT.json";

// Inlined here to avoid importing from `@runwae/i18n` root, which uses
// import-assertion JSON syntax that Metro doesn't yet support. Mirrors
// the implementation in packages/i18n/src/overrides.ts.
function applyOverrides<T extends Record<string, any>>(
  base: T,
  overrides: any,
): T {
  const out: any = Array.isArray(base) ? [...(base as any)] : { ...base };
  for (const key in overrides) {
    const ov = overrides[key];
    const bs = (base as any)[key];
    if (
      ov !== null &&
      typeof ov === "object" &&
      !Array.isArray(ov) &&
      bs !== null &&
      typeof bs === "object" &&
      !Array.isArray(bs)
    ) {
      out[key] = applyOverrides(bs, ov);
    } else if (ov !== undefined) {
      out[key] = ov;
    }
  }
  return out as T;
}

const enUS = applyOverrides(enGB as Record<string, any>, enUSOverrides);

const RESOURCES = {
  "en-GB": { translation: enGB },
  "en-US": { translation: enUS },
  "fr-FR": { translation: frFR },
  "es-MX": { translation: esMX },
  "es-ES": { translation: esES },
  "pt-BR": { translation: ptBR },
  "it-IT": { translation: itIT },
} as const;

// `Intl.DateTimeFormat().resolvedOptions().locale` returns the device's
// configured locale ("en-US", "fr-FR", etc.). resolveLocale() narrows it
// to one of the seven supported locales, falling back to FALLBACK_LOCALE.
function detectDeviceLocale(): SupportedLocale {
  try {
    const tag = Intl.DateTimeFormat().resolvedOptions().locale;
    return resolveLocale(tag);
  } catch {
    return FALLBACK_LOCALE;
  }
}

// Initialised synchronously at module load so any consumer that imports
// this file gets a configured singleton. `useTranslation` works without
// extra setup.
if (!i18next.isInitialized) {
  void i18next.use(initReactI18next).init({
    lng: detectDeviceLocale(),
    fallbackLng: FALLBACK_LOCALE,
    resources: RESOURCES,
    interpolation: { escapeValue: false },
    returnEmptyString: false,
    // i18next emits a warning to console for every missing key by default.
    // Until Phase 6.5 string extraction lands, every screen still uses
    // hardcoded English, so missing-key warnings would flood the logs.
    saveMissing: false,
    missingKeyHandler: () => {},
  });
}

export { i18next };
export {
  FALLBACK_LOCALE,
  LOCALE_NATIVE_NAMES,
  SUPPORTED_LOCALES,
  resolveLocale,
};
export type { SupportedLocale };
