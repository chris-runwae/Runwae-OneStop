export {
  SUPPORTED_LOCALES,
  SOURCE_LOCALE,
  FALLBACK_LOCALE,
  LOCALE_NATIVE_NAMES,
  resolveLocale,
} from "./locales";
export type { SupportedLocale } from "./locales";

export { applyOverrides } from "./overrides";
export type { Messages, MessageKey } from "./types";

import enGB from "../messages/en-GB.json" assert { type: "json" };
import enUSOverrides from "../messages/en-US.overrides.json" assert { type: "json" };
import frFR from "../messages/fr-FR.json" assert { type: "json" };
import esMX from "../messages/es-MX.json" assert { type: "json" };
import esES from "../messages/es-ES.json" assert { type: "json" };
import ptBR from "../messages/pt-BR.json" assert { type: "json" };
import itIT from "../messages/it-IT.json" assert { type: "json" };

import { applyOverrides } from "./overrides";
import type { Messages, SupportedLocale } from "./types";

// en-US is en-GB merged with a small overrides file. We compute it at
// module load so consumers can treat all locales uniformly.
const enUS: Messages = applyOverrides(enGB as Messages, enUSOverrides as any);

export const MESSAGES: Record<SupportedLocale, Messages> = {
  "en-GB": enGB as Messages,
  "en-US": enUS,
  "fr-FR": frFR as Messages,
  "es-MX": esMX as Messages,
  "es-ES": esES as Messages,
  "pt-BR": ptBR as Messages,
  "it-IT": itIT as Messages,
};
