# @runwae/i18n

Shared message catalogue and locale utilities for the Runwae apps.

`en-GB.json` is the source of truth. The 5 non-English locales (`fr-FR`, `es-MX`, `es-ES`, `pt-BR`, `it-IT`) are LLM-generated and marked beta in the app. `en-US` is derived from `en-GB` plus a small overrides file at module load.

See [`../../docs/i18n.md`](../../docs/i18n.md) for the full contributor guide.

## Quick reference

```bash
# Edit en-GB.json, then regenerate the other locales
pnpm --filter @runwae/i18n i18n:generate

# Only one locale
pnpm --filter @runwae/i18n i18n:generate -- --locale=fr-FR
```

Requires `ANTHROPIC_API_KEY`.
