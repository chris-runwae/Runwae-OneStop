# Runwae Launch Readiness Spec

> Created 2026-05-11. Drives the 8–12 week push to ship the mobile app (iOS App Store) and consumer web (`apps/web`) to production.

---

## Context

The product audit at `docs/product-overview.md` documented ~30 issues blocking launch (8 Critical, 8 High, 14 Medium) plus 10 planned features that were never built. The goal of this spec is to drive an 8–12 week launch push covering: the iOS App Store submission of `apps/mobile`, a credible public consumer web at `apps/web`, the verified Critical and High issues, and three headline product gaps that materially shape first-launch UX.

The mobile app already covers the core flows (auth, trip CRUD, AI generation, flight/hotel/event payments, social, push notifications). What stands between today and launch is: financial correctness (commission math), App Store compliance (Apple Sign-In entitlement, privacy policy, Android submit), polish (broken pull-to-refresh, swallowed payment errors, stub mutations), and three meaningful feature gaps the product roadmap calls for at v1.

The audit doc is a useful starting point but is out of date in several places. The Audit Corrections section below captures what the doc claims vs. what is actually in the code today.

---

## Scope summary

| Dimension | Decision |
|---|---|
| Launch target | iOS App Store (mobile) + consumer web at `apps/web` |
| Stretch target | Android Play Store if Phase 2 lands on time |
| Timeline | 8–12 weeks |
| Bug priorities | All Critical, all High, selected Medium (M3, M11, M12) |
| Headline gaps | Mobile Discover Grid → Sectioned Experiences → Trip from Link (in order) |
| Auth posture | Google + Apple Sign-In + email verification (most already exists) |
| Test coverage | Critical paths only — payments, auth, booking confirmation, commission math |
| Localisation | Ship 7 locales: `en-GB` (source), `en-US`, `fr-FR`, `es-MX`, `es-ES`, `pt-BR`, `it-IT`. LLM-only translations marked as beta. Auto-detect device locale on first launch with in-app override in Profile → Appearance. |
| Analytics | PostHog on mobile (unifies with existing web PostHog), feature flags + session replay + funnels |
| Branch baseline | `main` as of 2026-05-11. Worktree `claude/pedantic-borg-cb0898`. All file:line references in this spec are against this state. |
| Deferred to v1.1+ | Offline support, locales beyond the 7 above, human-reviewed translations (replacing the LLM beta), localised content (destinations, events, AI-generated trips stay in source language), 2FA backend, full a11y, image cache policy, reviews/share_links CRUD, search indexes, pagination, M1/M2/M4/M7/M9/M10/M13/M14 |

---

## Audit corrections

Before executing, log these because the source doc is misleading on each:

| Audit claim | Actual state |
|---|---|
| **C2** Email verification disabled | False — `VerifyOTP` is wired to the Password provider at `packages/convex/convex/auth.ts:90`. Verify end-to-end works; do not re-implement. |
| **C5** Schema index typo `by_entity_tyåpe` | False — `packages/convex/convex/schema.ts:211` correctly spells `by_entity_type`. No fix needed. |
| **C7** Live keys committed to git | Partial — `apps/mobile/.env` contains `pk_live_*` + `SENTRY_AUTH_TOKEN` but is not tracked by git. Still requires: (a) confirm `.gitignore` covers `apps/mobile/.env`, (b) rotate Sentry token, (c) move auth token to EAS secrets. |
| "Social login hidden" | False — `apps/mobile/components/auth/SocialAuthButtons.tsx:71` renders Google always, Apple on iOS via `Platform.OS` check. Buttons are live. |
| "Apple Sign-In not implemented" | Backend yes, iOS entitlement no — Apple provider is configured in `auth.ts`. Need to add the iOS capability + entitlement in `app.config.ts`. |
| "Mobile event ticket purchase deferred to Phase C" | False — already implemented at `apps/mobile/app/events/[id].tsx:59-120` with Stripe Payment Sheet. Include in test plan, not in build plan. |

After this spec lands, edit `docs/product-overview.md` to reflect these corrections so future contributors don't re-investigate red herrings.

---

## Phase 1 — Safety & verification (week 1)

Goals: lock down secrets, validate the financial correctness situation, smoke-test existing auth.

| Deliverable | Files / Actions |
|---|---|
| Confirm `.env` is gitignored, rotate Sentry token, move to EAS secrets | `apps/mobile/.gitignore`, EAS dashboard |
| Audit `commissions` table for 100x-inflated rows from C8 bug | One-off Convex query script; report counts by environment |
| Smoke-test email verification end-to-end (sign-up → OTP → boarding) | `packages/convex/convex/auth.ts`, `apps/mobile/app/(auth)/*` |
| Apply audit corrections to `docs/product-overview.md` | `docs/product-overview.md` |

---

## Phase 2 — Critical & High bug fixes (weeks 1–2)

| ID | Fix | Files |
|---|---|---|
| **C8** | Change `args.totalCommission * args.splitPct / 1` → `args.totalCommission * args.splitPct / 100` and add a Vitest unit test. If Phase 1 found inflated rows, ship a one-off `recomputeCommissions` action and run it once. | `packages/convex/convex/commissions.ts:16` |
| **C3** | Replace `{currency} {price.toFixed(0)}` with `Intl.NumberFormat(locale, { style: 'currency', currency }).format(price)`. Match the pattern already used in flights at `flights/book/payment.tsx:100-104`. | `apps/mobile/app/hotel/payment.tsx:206` |
| **H1** | Wire pull-to-refresh to actually refetch home queries (Convex `useQuery` patterns; call the relevant `refetch` or invalidate). | `apps/mobile/app/(tabs)/index.tsx:72-77` |
| **H2** | Remove `console.log` / `console.warn` from production paths; replace with `Sentry.addBreadcrumb` where useful. Sweep all `apps/mobile/app/**/*.tsx`. | grep `console\.` across `apps/mobile/app/` |
| **H3** | Either remove the redundant "Apply filters" button on Explore or make it apply filters via state, not just close the modal. | `apps/mobile/app/(tabs)/explore.tsx:68-71` |
| **H4** | Implement `removeMember(tripId, userId)` and `updateMemberRole(tripId, userId, role)` Convex mutations (owner-only auth) and wire the Context to them. | `apps/mobile/context/TripsContext.tsx:283-294`, new mutations in `packages/convex/convex/trips.ts` |
| **H5** | Replace stub `distanceKm = 2 + i*1.5, durationMin = 10 + i*5` with a real distance calc. Cheapest: Haversine between item lat/lng pairs + a configurable walking/driving speed. Live geocoding only when missing. | `apps/mobile/components/trip/TripItineraryTab.tsx:250`, `packages/convex/convex/itinerary.ts` `getDayWithTravelTimes` |
| **H6** | Show user-facing error UI (Toast or Alert) in payment catch blocks; preserve Sentry capture. | `apps/mobile/app/hotel/payment.tsx:150`, `apps/mobile/app/flights/book/payment.tsx:93` |
| **H7** | Replace `<ActivityIndicator>` with a `<SavedSkeleton>` matching project convention. | `apps/mobile/app/(tabs)/saved.tsx:73` |
| **H8** | Fix `dark-seconndary` → `dark-secondary` (double-n typo) and grep for any other occurrences. | `apps/mobile/app/(tabs)/saved.tsx:106-107` |
| **M3** | Drop the leftover `console.log('Applying filters: ...)` in Explore (covered by H2 sweep). | `apps/mobile/app/(tabs)/explore.tsx:69` |

---

## Phase 2.5 — Observability & i18n foundations (week 2, runs parallel with Phase 2)

Cross-cutting platform work. Lands early so later phases can already gate features with flags, fire events, and pull strings from `en.json`.

### PostHog (analytics + flags + replay)

| Deliverable | Notes |
|---|---|
| Install `posthog-react-native` in `apps/mobile` | Configure with `EXPO_PUBLIC_POSTHOG_KEY`. Initialize in root provider; capture session start. |
| Verify `posthog-js` config in `apps/web` | Confirm same project; same `distinct_id` strategy across surfaces. |
| Identify viewer on auth | Call `posthog.identify(userId, { email, currency, country })` after Convex auth completes; alias anonymous → identified. |
| Standard event taxonomy | Lock event names + properties in `packages/posthog-events/events.ts` (new shared package). Examples: `signup_started`, `signup_completed`, `boarding_completed`, `trip_created`, `flight_booked`, `hotel_booked`, `event_ticket_purchased`. |
| Session replay (mobile) | Enable PostHog session replay on mobile with `maskAllInputs` + `maskAllImages` for privacy. Sample at 10% for free tier headroom. |
| Feature flags | Stand up flags `flag_discover_grid`, `flag_trip_from_link`, `flag_sectioned_experiences`, `flag_apple_signin_kill_switch`. Default all to 0% in prod; ramp during Phase 6/8. |
| Funnels + retention dashboards | Pre-create PostHog dashboards before launch: signup funnel (`signup_started` → `signup_completed` → `boarding_completed` → `trip_created`); booking funnels (search → detail → checkout → confirmation); D1/D7/D30 retention cohorts. |
| Privacy disclosure | Add PostHog to privacy nutrition labels in Phase 3 + privacy policy copy. |

### i18n foundations (the heavy lifting lands in Phase 6.5; this phase wires the plumbing)

**Supported locales:** `en-GB` (source of truth), `en-US`, `fr-FR`, `es-MX`, `es-ES`, `pt-BR`, `it-IT`. Locale codes follow BCP 47.

**Scope reminder:** UI strings + Intl formatters + plural rules + locale picker. Content (admin-curated destinations/events, AI-generated trips, provider API data) stays in its source language.

| Deliverable | Notes |
|---|---|
| Mobile: install `i18next` + `react-i18next` + `expo-localization` + `intl-pluralrules` | Detect device locale via `Localization.getLocales()[0]`. If device locale doesn't match a supported one, fall back to `en-GB`. Set up `apps/mobile/i18n/index.ts`. |
| Web: install `next-intl` + matching plural rules | Server-side locale negotiation via `Accept-Language` and `?locale=` param. Default `en-GB`. `apps/web/i18n/` with messages directory and middleware for locale-prefixed routes. |
| Shared messages package | New `packages/i18n/` workspace holding the source `en-GB.json` (and the 6 generated locale files). Both apps import from the shared package so a translation update lands once. |
| Translation registry | One `messages/<locale>.json` per locale. `en-GB.json` is the canonical source; all others are generated and committed (regeneration runs via a script — see Phase 6.5). |
| String extraction starter | Migrate user-facing copy from auth, onboarding, home tab, tab labels, primary error messages, and payment screens into `en-GB.json`. Leave deep-stack screens to be extracted as touched in Phases 2/5/6. |
| Locale-aware formatters | Update `formatCurrency`, `formatDate`, `formatRelativeTime` in `@/lib/utils` to accept a locale argument; default to the active i18n locale via a `useLocale()` hook. The C3 hotel payment fix already uses `Intl.NumberFormat(undefined, …)` — switch to passing the active locale. |
| Convex error codes | Wrap throws in member/trip/booking mutations with an error-code convention (`error.code` on a thrown class) so the client can map to a localised message. Backwards-compat: keep the English message as `error.message` for logs. Apply only to user-facing throws; internal asserts stay free-text. |
| Locale picker UI | Mobile: new section in `profile/appearance/index.tsx` with a list of supported locales (native name shown, e.g. "English (UK)", "Français", "Español (México)"). Web: `Profile → Appearance`. Persist to `users.locale` (new optional field on the users table) and `Localization` storage so the choice survives reinstalls. |
| Schema field | Add `locale: v.optional(v.string())` to the `users` table. Auth-created rows leave it null; the locale picker writes it. The client prefers `users.locale` over device locale when set. |
| ESLint guard | Add `react/jsx-no-literals` (with a sensible whitelist for non-translatable values like icon names and brand strings) so new screens added in Phases 5/6 can't reintroduce hardcoded English. |
| Translation pipeline doc | `docs/i18n.md` covering: how to add a string, how to regenerate the 6 generated locale files, how to add an 8th locale post-launch, the human-review upgrade path. |

---

## Phase 3 — App Store / launch infra (weeks 2–3)

| Deliverable | Notes |
|---|---|
| iOS Apple Sign-In capability | Add `expo-apple-authentication` plugin to `apps/mobile/app.config.ts`. Verify in Xcode that Sign In with Apple capability is on the App ID in App Store Connect. |
| Apple credential revoke listener | Required by App Store: register `AppleAuthentication.useCredentialsRevokedListener` on app launch to sign out users whose credentials were revoked. |
| Android Play Store submit config | Extend `apps/mobile/eas.json` with an `android` submit profile (service account JSON path, track: `internal`). Set up Play Console listing. |
| Privacy Policy URL + Terms of Service | Confirm `apps/mobile/app/profile/about/*` pages have finalized content. Add `NSPrivacyAccessedAPITypes` if needed. Set `privacyPolicyUrl` for both stores. |
| Location permission usage strings | Replace the generic "Allow Runwae to use your location" in `app.config.ts` with specific copy for `NSLocationWhenInUseUsageDescription`. |
| ATT declaration | App does not track across sites; declare exempt in App Store Connect privacy nutrition. PostHog usage stays first-party (no IDFA), still declare it under "Analytics → Product Interaction". |
| Age rating | 12+ recommended (social features). Configure in both consoles. |
| Sentry alerting | Set crash-free-session threshold + Slack alert routing for releases. |
| OTA channels | Verify `expo-updates` channel mapping for the production profile. |

---

## Phase 4 — Auth polish (week 3)

Most of auth is already done. Items here are verification + the iOS-specific revoke listener that lands in Phase 3.

| Deliverable | Notes |
|---|---|
| Google Sign-In on Android | Verify SHA-1 fingerprints in Convex `AUTH_GOOGLE_ID` config support Android variants. |
| Apple Sign-In end-to-end on iOS | Test full flow on TestFlight build (entitlement set, returns identity token, Convex creates user row). |
| Email verification smoke test | Sign-up → check email → enter OTP → land in boarding. Run on iOS, Android, web. |
| Web auth parity | Confirm `apps/web/app/(auth)/sign-in/page.tsx` Google + Password flows work. |

---

## Phase 5 — Web placeholder pages (weeks 3–4)

| Deliverable | Files |
|---|---|
| Public trip page `/t/[slug]` — hero, dates, itinerary preview, signup CTA, share metadata | `apps/web/app/(public)/t/[slug]/page.tsx` (currently `<h1>Trip: {slug}</h1>`) |
| Public destination page `/d/[slug]` — hero, gallery, recommendations, signup CTA | `apps/web/app/(public)/d/[slug]/page.tsx` (currently `<h1>{slug}</h1>`) |
| Dynamic home hero | Replace hardcoded Lisbon image + title in `HomePageClient.tsx` with viewer-personalized seed (Convex destinations table top-of-month). Replace `"9"` activities-planned stat with the real value (count of `itinerary_items` for the trip). |

`/e/[slug]` is already real — use it as the structural reference for the trip/destination pages.

---

## Phase 6 — Headline feature gaps (weeks 4–9)

Order: easiest → hardest. Each unblocks pattern reuse for the next.

### 6A. Mobile Discover Grid (~2 weeks)

Spec: `docs/mobile-discover-plan.md`. Gate behind `flag_discover_grid` (default 0%, ramp during Phase 8).

Build a shared `DiscoverGrid` component (10 chips: All, Fly, Stay, Do, Explore, Adventure, Eat/Drink, Attend, Shop, Relax) that consumes the existing `api.discovery.searchByCategory` action at `packages/convex/convex/discovery.ts:49`. Wire it on Home (`apps/mobile/app/(tabs)/index.tsx`). Migrate `apps/mobile/components/destination/RecommendationsSection.tsx` to be a thin wrapper around `DiscoverGrid` (drops the legacy `useViatorCategory`/`useHotels` hooks; covers the 5 of 10 categories that destination context exposes). Move chip constants to `packages/ui/`. Use i18n keys for chip labels (`discover.chips.all`, `discover.chips.fly`, etc.).

### 6B. Sectioned Experience Results (~1.5 weeks)

Spec: `docs/experiences-chip-spec.md`. Gate behind `flag_sectioned_experiences`.

Branching already exists at `apps/mobile/app/experiences-search/results.tsx:76-121`. Build the missing components: `SectionedExperiencesResults`, `CollapsibleSection`, `DiscoverHScroll`, `DiscoverAddOnCard`, `DiscoverEventCard`. Reuse patterns from `DiscoverGrid` where possible. Backend `searchByCategory` already supports section keys.

### 6C. Trip from YouTube/TikTok link (~3 weeks)

Spec: `docs/trip-from-link-spec.md`. Largest item; cuttable if timeline slips. Gate behind `flag_trip_from_link`; start at 0% and ramp post-launch.

- New Convex action `tripFromLink(url)` in `packages/convex/convex/ai.ts`: Whisper transcription → Claude Haiku 4.5 extraction → call existing `_materializeFreeFormTrip` to write to Convex.
- Hybrid execution: <4min inline, >4min as a background job (Convex scheduled function).
- New mobile screen `apps/mobile/app/create-trip-from-link.tsx`.
- URL paste detection in global search at `apps/mobile/app/search.tsx`.
- Deep-link handler for YouTube/TikTok share intents.
- Fire `trip_from_link_started` / `trip_from_link_completed` / `trip_from_link_failed` PostHog events.

---

## Phase 6.5 — Translation generation + locale QA (weeks 8–9)

After Phases 2–6 have extracted strings into `packages/i18n/messages/en-GB.json`, fan out to the other six locales. Marked **beta** in app settings (a small "Translations in beta" hint under the picker) because there's no human review pass before launch.

| Deliverable | Notes |
|---|---|
| `en-US` derivation | Copy `en-GB.json`. Apply a small overrides file for the ~30–80 strings that differ (spellings: colour→color, optimise→optimize, favourite→favorite; words: mum→mom, holiday→vacation; currency examples; date examples). The build merges `en-GB.json` + `en-US.overrides.json`. |
| Generate `fr-FR`, `es-MX`, `es-ES`, `pt-BR`, `it-IT` | Script: `pnpm i18n:generate`. Calls Claude (already integrated for AI trips) with the canonical `en-GB.json` plus a system prompt that includes (a) glossary of brand/product nouns to leave verbatim (Runwae, Discover, Trips, Stays, Fly, etc.), (b) tone guidance ("warm, energetic travel platform; informal `tu`/`tú` in es and `vous` in fr business surfaces"), (c) ICU MessageFormat hints so plurals and variable interpolation survive. Output is committed under `packages/i18n/messages/<locale>.json`. |
| Plural smoke test | Vitest covers each locale's pluralization rules with representative strings ("1 trip", "2 trips", "5 itinéraires"). Locales with multiple plural forms (Arabic, Russian) are not in scope, so this stays simple. |
| Locale-aware Intl checks | A Vitest matrix asserts `formatCurrency` renders `£`, `$`, `€`, `R$`, `MX$` correctly per locale, and `formatDate` outputs MDY for `en-US` vs DMY for `en-GB`. |
| App Store localised metadata | App Store Connect supports per-locale metadata. Generate localised app name (kept as "Runwae" across the board), subtitle, keywords, description, and *what's new* for each locale via the same LLM pipeline. Screenshots stay English-only at v1 (separate sprint to localise screenshots). |
| Beta-translation disclosure | A one-line copy strip under the locale picker: "Translations are machine-generated. Help us improve them by reporting issues." Wire the "Report" link to the existing `issue_reports` system tagged `category: translation`. |

---

## Phase 7 — Critical-path tests (weeks 8–10)

Run in parallel with the tail end of Phase 6.

| Surface | Framework | Cases |
|---|---|---|
| Convex backend | Vitest + `convex-test` | `commissions.calculate` (incl. C8 fix), `bookings.create`, `trips.addMember/removeMember/updateMemberRole`, `auth.verifyOTP` |
| Mobile | Maestro | Sign-up + email verify → boarding → home; hotel search → pay → confirmation; flight search → pay → confirmation; event ticket purchase; locale switch in Profile → Appearance survives an app restart |
| Web | Playwright | Sign-in (password + Google), event detail → Stripe Checkout → success, public event page render |
| i18n | Vitest | Plural rules per locale, `formatCurrency`/`formatDate` Intl matrix, missing-key fallback to `en-GB`, locale persistence to `users.locale` |

---

## Phase 8 — Submission + flag ramp (weeks 10–12)

| Deliverable | Notes |
|---|---|
| App Store Connect metadata | Screenshots (6.7", 6.5", 5.5" if requested), description, keywords, support URL, marketing URL, age rating, export compliance, ATT declaration |
| Privacy nutrition labels | Both stores — declare Stripe (payment data), Convex (user content), Sentry (diagnostics), PostHog (product interaction + session replay) |
| Localised store metadata | Submit per-locale app name, subtitle, keywords, description, "what's new" for `en-GB`, `en-US`, `fr-FR`, `es-MX`, `es-ES`, `pt-BR`, `it-IT`. Screenshots remain English-only at v1. |
| Feature flag ramp plan | Pre-launch: all flags at 0%. Day 1: `flag_discover_grid` → 25%. Week 2: → 100% if no anomalies in PostHog funnels. `flag_sectioned_experiences` follows. `flag_trip_from_link` stays at 10% for 2 weeks to validate cost & quality before ramping. |
| Play Console listing | Store listing, content rating, target audience, data safety form |
| TestFlight beta | Internal then external (≥10 testers) for ≥48h |
| Submit for review | iOS first, then Android |
| Iterate on rejection | Build in a 1-week buffer for App Review feedback |

---

## Verification

How to know each phase actually works:

- **Phase 1**: `git ls-files apps/mobile/.env` returns nothing; Sentry shows a new auth token in use; commissions table audit script reports `0` inflated rows OR a `recompute` action has run.
- **Phase 2**: Each fix has either a Vitest unit test (C8) or a manual repro doc; H1 reload visibly refetches home data; payment errors surface a user-facing message.
- **Phase 2.5**: PostHog dashboard shows live events from a TestFlight build; the four feature flags are visible in the PostHog UI; `apps/mobile` boots in a non-English iOS device locale and shows the i18n fallback to English (not a missing-key error).
- **Phase 3**: TestFlight build with Apple Sign-In opens the native sheet and creates a user row; `eas submit --platform android` dry-run succeeds.
- **Phase 4**: Full sign-in matrix (Password + Google + Apple) × (iOS + Android + Web) green.
- **Phase 5**: `/t/<slug>` and `/d/<slug>` render real content with OG tags; home hero changes when viewer's preferred location changes.
- **Phase 6A/6B**: All 10 chips on home return results within 3s; sectioned experiences screen renders 5 collapsible sections from a single search.
- **Phase 6C**: Pasting a YouTube travel vlog URL produces a multi-day trip in <4min for short videos; long videos return a job ID and notify on completion.
- **Phase 7**: All test suites green on CI; payment-path tests catch a deliberately re-introduced C8 regression.
- **Phase 8**: TestFlight build accepted; app live on the App Store.

---

## Open risks

1. **C8 historical damage** — if any real bookings already wrote inflated commission rows, the recompute action must run before launch; otherwise host payouts will be wrong. Phase 1 audit is decisive.
2. **Apple Sign-In review rejections** — App Store sometimes rejects builds for missing the credential-revoke listener. Phase 3 must include it; do not rely on the backend provider alone.
3. **Whisper cost** — Trip-from-link processes audio per video. If launch traffic spikes, this could blow the AI budget. Set a per-user quota in Phase 6C.
4. **No CI yet for mobile** — Phase 7 tests need a Maestro CI runner (EAS Build supports this). Stand it up early in Phase 7.
5. **Web public pages SEO** — Phase 5 pages need OG tags + sitemap entries to be valuable shareable surfaces.
6. **PostHog cost ramp** — session replay at 10% sample on mobile + flags + events should stay inside the 1M event/month free tier for early launch traffic, but trip-from-link replays of long Whisper jobs could spike usage. Set a PostHog billing alert before launch.
7. **i18n string drift** — if i18n scaffolding lands in Phase 2.5 but new screens get added in Phases 5/6 without using `t('...')`, English strings re-enter the codebase. Add an ESLint rule (`react/jsx-no-literals` with a small whitelist) to prevent regressions.
8. **LLM-translation quality** — without human review, locales may have awkward phrasing in payment/error surfaces. Mitigation: (a) the "beta translation" disclosure under the picker, (b) in-app report path tagged `category: translation` routes to the existing `issue_reports` flow, (c) post-launch sprint dedicated to native-speaker review of customer-visible strings (auth, payments, error messages first). |
9. **Locale-tagged content drift** — content (destinations, events) stays in source language at launch. Users may find that switching to French still shows English destination descriptions. Mitigation: add a one-time onboarding tooltip clarifying that the *app* speaks their language but *content* is currently in source language only.

---

## Critical file index

| Concern | File |
|---|---|
| Commission bug | `packages/convex/convex/commissions.ts:16` |
| Hotel currency bug | `apps/mobile/app/hotel/payment.tsx:206` |
| Refresh stub | `apps/mobile/app/(tabs)/index.tsx:72-77` |
| Stub member mutations | `apps/mobile/context/TripsContext.tsx:283-294` |
| Payment catch blocks | `apps/mobile/app/hotel/payment.tsx:150`, `apps/mobile/app/flights/book/payment.tsx:93` |
| Saved screen typos | `apps/mobile/app/(tabs)/saved.tsx:73,106-107` |
| Auth providers | `packages/convex/convex/auth.ts:90` |
| Social auth UI | `apps/mobile/components/auth/SocialAuthButtons.tsx:71` |
| Mobile app config | `apps/mobile/app.config.ts` |
| EAS submit config | `apps/mobile/eas.json` |
| Web public pages | `apps/web/app/(public)/t/[slug]/page.tsx`, `apps/web/app/(public)/d/[slug]/page.tsx` |
| Web home hardcodes | `apps/web/components/HomePageClient.tsx` (find via grep) |
| Discover backend | `packages/convex/convex/discovery.ts:49` |
| Recommendations component | `apps/mobile/components/destination/RecommendationsSection.tsx` |
| Experiences results | `apps/mobile/app/experiences-search/results.tsx:76-121` |
| Trip-from-link spec | `docs/trip-from-link-spec.md` |
| Mobile Discover spec | `docs/mobile-discover-plan.md` |
| Experiences chip spec | `docs/experiences-chip-spec.md` |
| PostHog event taxonomy (new) | `packages/posthog-events/events.ts` |
| Mobile i18n entry (new) | `apps/mobile/i18n/index.ts` |
| Web i18n entry (new) | `apps/web/i18n/` + `apps/web/middleware.ts` (locale negotiation) |
| Shared messages package (new) | `packages/i18n/messages/{en-GB,en-US,fr-FR,es-MX,es-ES,pt-BR,it-IT}.json` (canonical source: `en-GB.json`) |
| `en-US` overrides (new) | `packages/i18n/messages/en-US.overrides.json` (small file: spelling/word swaps only) |
| Translation generator (new) | `packages/i18n/scripts/generate.ts` — calls Claude with the canonical en-GB to produce/refresh the 5 non-English locale files |
| Locale picker UI (new) | mobile: section in `apps/mobile/app/(tabs)/profile/appearance/index.tsx`; web: equivalent section in `apps/web/app/(app)/profile/appearance/page.tsx` |
| Users schema field | `users.locale` added in `packages/convex/convex/schema.ts` |
| i18n contributor doc (new) | `docs/i18n.md` |
