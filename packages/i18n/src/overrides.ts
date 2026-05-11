// Apply a sparse overrides file on top of a full base messages object.
// Used at build time for en-US, which is en-GB plus a small list of
// spelling/word swaps. Recurses into nested objects.

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export function applyOverrides<T extends Record<string, any>>(
  base: T,
  overrides: DeepPartial<T>,
): T {
  const out: any = Array.isArray(base) ? [...base] : { ...base };
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
      out[key] = applyOverrides(bs, ov as any);
    } else if (ov !== undefined) {
      out[key] = ov;
    }
  }
  return out as T;
}
