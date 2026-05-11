import type enGB from "../messages/en-GB.json";

// The canonical message shape is derived from en-GB.json so all other
// locales must structurally match it. The translation generator script
// validates this; runtime missing-key lookups fall back to en-GB.
export type Messages = typeof enGB;

// String-leaf flattening for autocomplete. Use as the type of any `t(...)`
// translation key consumer:
//
//   const t = useTranslation();
//   t("auth.signIn.title")  // typed
type Flatten<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : T[K] extends Record<string, unknown>
      ? Flatten<T[K], `${Prefix}${K}.`>
      : never;
}[keyof T & string];

export type MessageKey = Flatten<Messages>;
