import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@runwae/convex/convex/_generated/api";

import { i18next, resolveLocale } from "@/lib/i18n";

// Bridges the server-stored `users.locale` field to the in-app i18next
// singleton. When a user signs in (or their preference changes from
// another device), this swaps i18next.language so the next render
// reflects the right messages + formatters.
//
// Server is the source of truth. Device locale was the *initial* default
// at module load (in lib/i18n.ts); once the viewer's preference loads
// from Convex, we honour that instead.
export default function LocaleSync() {
  const viewer = useQuery(api.users.getCurrentUser);
  const stored = viewer?.locale;

  useEffect(() => {
    if (!stored) return;
    const resolved = resolveLocale(stored);
    if (i18next.language !== resolved) {
      void i18next.changeLanguage(resolved);
    }
  }, [stored]);

  return null;
}
