# Phase 3 Handover — App Store / Launch Infra

> **For the new Claude session picking this up:** You have no prior conversation context. Read this doc end-to-end before touching any file. It contains everything you need.

> **Read first:** [`docs/launch-readiness-spec.md`](launch-readiness-spec.md) — the full 8–12 week plan. This handover covers Phase 3 (weeks 2–3) only.

---

## Context

Runwae is a Turborepo monorepo (mobile + web + admin + hosts + Convex backend) targeting an iOS App Store + consumer-web launch. A product audit at [`docs/product-overview.md`](product-overview.md) documented ~30 issues; the launch readiness spec partitioned them into 9 phases.

**What's already merged into `main`** (PR [#23](https://github.com/chris-runwae/oneStop/pull/23)):

- The launch readiness spec itself.
- Phase 1 + 2 critical/high bug fixes (C8 commission math, C3 currency formatting, H1 pull-to-refresh, H4 member mutations, H6 payment error UI, H7 skeleton, H8 dark-secondary token, H2 console.log sweep).
- i18n foundations: new `@runwae/i18n` workspace package, canonical `en-GB.json`, LLM translation generator, Convex `users.locale` field + `setLocale` mutation.

**Decisions already locked in** (per spec scope table):

| Dimension | Decision |
|---|---|
| Launch target | iOS App Store + consumer web (`apps/web`). Android Play Store is a stretch goal in this phase. |
| Auth posture | Google + Apple Sign-In + email verification. Apple/Google buttons already render (`apps/mobile/components/auth/SocialAuthButtons.tsx:71`). Convex provider for Apple is already configured (`packages/convex/convex/auth.ts:90`). The iOS *entitlement* is missing — that's the Phase 3 work. |
| Analytics | PostHog (matches web). Install + event taxonomy is Phase 2.5, not Phase 3. |
| Localisation | Ship 7 locales (`en-GB` source, `en-US` overrides, `fr-FR`/`es-MX`/`es-ES`/`pt-BR`/`it-IT` generated). Foundations landed; locale picker UI + i18next/next-intl wiring is Phase 2.5 continuation, not Phase 3. |
| Tests | Critical paths only (payments, auth, booking, commissions). Phase 7. |

**Pending user actions still outstanding** (these block Phase 3 from being fully complete but not from starting):

1. Rotate the Sentry auth token in `apps/mobile/.env` and move it to EAS secrets (`eas secret:create`). The token is local-only today (not in git) but shouldn't live in a `.env` file.
2. Verify whether the `pk_live_*` Stripe key in `apps/mobile/.env` is intentional for dev builds. If dev should hit Stripe test mode, swap to `pk_test_*` for the dev/preview EAS profiles.
3. Provide `EXPO_PUBLIC_POSTHOG_KEY` when ready for Phase 2.5 PostHog instrumentation.

---

## Phase 3 scope (weeks 2–3 of the 8–12 week launch window)

Seven deliverables. Treat them as roughly parallel — none blocks the others.

| # | Deliverable | Code change? | User action required? |
|---|---|---|---|
| 1 | Apple Sign-In iOS entitlement + credential-revoke listener | Yes | Toggle capability in App Store Connect |
| 2 | Android EAS submit profile | Yes | Generate Play Console service-account JSON |
| 3 | Specific location permission usage strings | Yes | None |
| 4 | Privacy nutrition labels + ATT exemption declaration | Doc only | Submit on App Store Connect + Play Console |
| 5 | Privacy Policy + Terms of Service hosting + URLs | Yes (config) | Confirm or finalize hosted policy content |
| 6 | Sentry release tagging + crash-free alerting | Yes (release tagging); Doc (alerting) | Set up alert routes in Sentry |
| 7 | OTA channel verification | Verification only | None |

---

## Step-by-step

### 1. Apple Sign-In iOS entitlement + credential-revoke listener

**Why:** Apple's backend OAuth provider is already wired in Convex (`packages/convex/convex/auth.ts:90`), and `SocialAuthButtons.tsx` already renders the Apple button on iOS via `Platform.OS === "ios"`. But the iOS *app entitlement* for Sign In with Apple is not in `app.config.ts`, so a TestFlight build will not actually present the native sheet. Apple Review will also reject builds that offer social login without a Sign in with Apple option *and* without the credential-revoke listener.

**Files to edit:**

- [`apps/mobile/app.config.ts`](../apps/mobile/app.config.ts) — add the `expo-apple-authentication` plugin entry inside the `plugins` array (currently around line 132–171). This auto-registers the iOS capability + entitlement at prebuild time.
- [`apps/mobile/app/_layout.tsx`](../apps/mobile/app/_layout.tsx) — register `AppleAuthentication.useCredentialsRevokedListener` at app launch so users whose Apple credentials are revoked get signed out on next open.

**Step-by-step:**

1. Add to `app.config.ts` plugins array:
   ```ts
   [
     'expo-apple-authentication',
     {},
   ],
   ```
2. Install the package: `pnpm --filter runwae-mobile add expo-apple-authentication`. The plugin handles `ios.usesAppleSignIn: true` and the entitlement automatically — no manual entitlements.plist editing.
3. In `_layout.tsx`'s root provider (or a dedicated `useAppleCredentialsRevoke` hook), wire the listener:
   ```ts
   import * as AppleAuthentication from 'expo-apple-authentication';
   import { useEffect } from 'react';

   useEffect(() => {
     if (Platform.OS !== 'ios') return;
     const sub = AppleAuthentication.useCredentialsRevokedListener(async () => {
       // sign out via Convex Auth, clear local state
       await signOut();
     });
     return () => sub.remove();
   }, []);
   ```
4. Verify the package's `signIn()` is what `SocialAuthButtons.tsx` actually calls (it should already be wired since the buttons render — confirm the auth flow uses `expo-apple-authentication` rather than a manual identity-token flow).
5. Build a preview (`eas build --profile preview --platform ios`) and verify the native Apple Sign-In sheet appears.

**User action needed:**

- Open App Store Connect → your app (ASC ID `6765879787`, team `5WJR695A8F`) → Identifiers → confirm the App ID has **Sign In with Apple** capability checked. If it's not already, toggle it on. (One-time setup per bundle ID.)

**Verification:** TestFlight build presents the native Apple sheet, returns an identity token, Convex creates a user row. Then revoke the credential in iOS Settings → Apple ID → Password & Security → Apps Using Apple ID → Runwae → Stop Using. Open the app — the listener should sign the user out on next launch.

---

### 2. Android EAS submit profile

**Why:** `eas.json` currently only configures iOS submission (`appleId`, `ascAppId`, `appleTeamId` at lines 51–63). There's no `submit.production.android` block, so `eas submit --platform android` will fail. Android Play Store submission is a stretch goal for this launch window — set up the config now so it's ready when you're ready to ship to Play.

**Files to edit:**

- [`apps/mobile/eas.json`](../apps/mobile/eas.json) — extend the `submit.production` (and `submit.preview`) blocks with an `android` section.

**Step-by-step:**

1. **User action** (precondition):
   - Create the Play Console listing for `app.runwae.io` (production) and `app.runwae.preview` (preview).
   - In Play Console → Setup → API access, create a service account, grant it "Release manager" role on the app, and download the JSON key.
   - Store the JSON key as an EAS secret: `eas secret:create --scope project --name GOOGLE_PLAY_SERVICE_ACCOUNT --type file --value ./google-play-service-account.json`. Or commit the path-only reference in `eas.json` if storing the file in an out-of-repo secrets location.
2. Add to `eas.json`:
   ```json
   "submit": {
     "production": {
       "ios": { /* existing */ },
       "android": {
         "serviceAccountKeyPath": "./google-play-service-account.json",
         "track": "internal",
         "releaseStatus": "draft"
       }
     },
     "preview": {
       "ios": { /* existing */ },
       "android": {
         "serviceAccountKeyPath": "./google-play-service-account.json",
         "track": "internal",
         "releaseStatus": "draft"
       }
     }
   }
   ```
3. Add the JSON key path to `.gitignore` if it's local:
   ```
   /apps/mobile/google-play-service-account.json
   ```
4. Document the submit flow in the existing dev docs (or add to `docs/mobile-build-and-submit.md` if it doesn't exist): `eas submit --platform android --profile production`.

**Verification:** Dry-run with `eas submit --platform android --profile production --no-wait` should authenticate and start an upload. (Don't actually publish a draft to Play until the app is ready.)

---

### 3. Specific location permission usage strings

**Why:** [`app.config.ts:162`](../apps/mobile/app.config.ts) currently uses generic copy: `locationPermission: 'Allow Runwae to use your location'`. Apple Review prefers user-readable, specific copy explaining *what* the app does with location. Generic copy can prompt rejection or, more commonly, reduce conversion on the system prompt.

**Files to edit:**

- [`apps/mobile/app.config.ts`](../apps/mobile/app.config.ts) — the `expo-maps` plugin block at line 158–164.
- For iOS, also add explicit `NSLocationWhenInUseUsageDescription` to `ios.infoPlist` (line 75–77) — the `expo-maps` plugin sets it automatically, but having an explicit value lets you customize per-context if needed.

**Step-by-step:**

1. Replace the generic copy with context-specific language:
   ```ts
   [
     'expo-maps',
     {
       requestLocationPermission: true,
       locationPermission: 'Runwae uses your location to suggest nearby trips, events, and experiences on your home feed.',
     },
   ],
   ```
2. If location is also requested elsewhere (e.g., on a search screen), add a second copy variant in `ios.infoPlist`:
   ```ts
   ios: {
     ...
     infoPlist: {
       LSApplicationQueriesSchemes: ['whatsapp', 'twitter'],
       NSLocationWhenInUseUsageDescription:
         'Runwae uses your location to suggest nearby trips, events, and experiences on your home feed.',
     },
   },
   ```
3. Verify which screens request location. Grep `getCurrentPositionAsync\|requestForegroundPermissionsAsync\|expo-location\|expo-maps` across `apps/mobile/`. The current evidence (home screen `LocationPrompt` component) suggests this is the only request site — but verify.

**Verification:** Build and run. When the location prompt appears, the copy should match the new string.

---

### 4. Privacy nutrition labels + ATT exemption declaration

**Why:** Both App Store Connect and Play Console require declaring what user data the app collects, who has access, and whether it's used for tracking. Apple's App Tracking Transparency (ATT) framework requires the app to either implement the ATT prompt or declare exemption. Runwae doesn't track users across other apps/sites (no IDFA collection, no third-party advertising frameworks), so it's ATT-exempt — but you must declare that explicitly.

**Files to edit:**

- [`apps/mobile/app.config.ts`](../apps/mobile/app.config.ts) — for ATT exemption, no code changes needed; this is declared in App Store Connect.
- New doc: [`docs/privacy-data-collection.md`](privacy-data-collection.md) — the canonical list of what data is collected, by whom, for what purpose. Both stores' privacy questionnaires will pull from this.

**Step-by-step:**

1. Create `docs/privacy-data-collection.md` with the following data-collector inventory (verify each against the current codebase):

   | Collector | Data type | Purpose | Linked to user? | Used for tracking? |
   |---|---|---|---|---|
   | Convex | Email, name, avatar, location preferences, trips, posts, polls, expenses, friendships | Provide app functionality | Yes | No |
   | Stripe | Payment info, card token, billing address | Process payments | Yes | No |
   | Sentry | Diagnostic data, crash reports, performance metrics | Bug fixes | Linked to user ID only | No |
   | PostHog (when added Phase 2.5) | Product interaction events, session replays | Product analytics | Linked to user ID only | No |
   | Apple Sign-In | Apple ID identity token, email (relay address if user chose) | Authentication | Yes | No |
   | Google Sign-In | Google account email, name, profile picture | Authentication | Yes | No |

2. **User action** — open App Store Connect → App Privacy → fill in the privacy questionnaire using the table above. Declare ATT exempt (no tracking across apps/sites). Repeat in Play Console → Data Safety.

3. (Optional code-side declaration) Add `NSUserTrackingUsageDescription` to `ios.infoPlist` *only* if you later add a tracking framework. Today, omit it.

**Verification:** Submit a TestFlight build — if ATT is incorrectly declared, App Review will reject. If correctly declared, the build moves to review without ATT-related friction.

---

### 5. Privacy Policy + Terms of Service URLs

**Why:** Both stores require publicly hosted privacy-policy and ToS URLs. The mobile app already has in-app pages at [`apps/mobile/app/(tabs)/profile/about/privacy-policy.tsx`](../apps/mobile/app/(tabs)/profile/about/privacy-policy.tsx) and `terms-of-service.tsx`, but these are 55–58 line files and likely still placeholder content. The store-facing URLs must point to a hosted web version.

**Files to edit:**

- [`apps/mobile/app.config.ts`](../apps/mobile/app.config.ts) — no required field, but add `extra.privacyPolicyUrl` + `extra.termsOfServiceUrl` for reference from inside the app.
- [`apps/web/app/(public)/privacy/page.tsx`](../apps/web/app/(public)) and `terms/page.tsx` — create these as the hosted source-of-truth. Mirror the mobile content; export from a shared MDX file if needed.
- [`apps/mobile/app/(tabs)/profile/about/privacy-policy.tsx`](../apps/mobile/app/(tabs)/profile/about/privacy-policy.tsx) — finalize the content (review what's there; if it's placeholder, replace with full text).
- [`apps/mobile/app/(tabs)/profile/about/terms-of-service.tsx`](../apps/mobile/app/(tabs)/profile/about/terms-of-service.tsx) — same.

**Step-by-step:**

1. Read the current state of the four files above. If content is placeholder (likely), get the user to provide finalized policy text (or use a template; common SaaS templates: Termly, iubenda, Vanta). **Do not generate legal text autonomously — flag this to the user as a content-not-engineering task.**
2. Once finalized, host on `runwae.io/privacy` and `runwae.io/terms` (or `app.runwae.io/privacy`, `/terms`). The marketing site or `apps/web` are both valid hosts — pick the one that's more likely to stay up.
3. Add to `app.config.ts`:
   ```ts
   extra: {
     privacyPolicyUrl: 'https://runwae.io/privacy',
     termsOfServiceUrl: 'https://runwae.io/terms',
   },
   ```
4. **User action** — paste these URLs into App Store Connect → App Information → Privacy Policy URL, and Play Console → Store listing → Privacy Policy.

**Verification:** Both URLs must be publicly accessible (no auth wall). Test with `curl -I` from outside the network.

---

### 6. Sentry release tagging + crash-free-session alerting

**Why:** Sentry is already wired (`@sentry/react-native/expo` plugin in [`app.config.ts:148-155`](../apps/mobile/app.config.ts), DSN/auth in `apps/mobile/.env`). What's missing: (a) release tagging so Sentry knows which app version each crash belongs to, (b) alert routing so the team gets notified when crash-free-session drops below a threshold.

**Files to edit:**

- [`apps/mobile/app/_layout.tsx`](../apps/mobile/app/_layout.tsx) (or wherever `Sentry.init` is called — grep `Sentry.init` to find it) — add the `release` field driven by `expo-updates`'s runtime version and update ID.
- Sentry dashboard (user-side) — create the alert rule.

**Step-by-step:**

1. Find the current `Sentry.init` call. Confirm `release` is either set from `Updates.runtimeVersion + '+' + Updates.updateId` or from EAS Build's `EAS_BUILD_ID`. If not, add it:
   ```ts
   import * as Updates from 'expo-updates';
   import * as Sentry from '@sentry/react-native';
   import { nativeApplicationVersion } from 'expo-application';

   const release = Updates.updateId
     ? `${nativeApplicationVersion}+${Updates.updateId}`
     : nativeApplicationVersion ?? 'dev';

   Sentry.init({
     dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
     release,
     dist: Updates.runtimeVersion,
     // ...existing config
   });
   ```
2. Verify Sentry source maps are uploaded on EAS build. The `@sentry/react-native/expo` plugin handles this automatically when `SENTRY_AUTH_TOKEN` is set in the EAS build env (it is, per `eas.json:29-30,45`). Confirm by running `eas build --profile preview --platform ios` and inspecting the build log for "Sentry: source maps uploaded successfully".
3. **User action — Sentry dashboard:**
   - Open Sentry → Alerts → Create Alert → "Crash-Free Session Rate".
   - Threshold: alert when crash-free-session rate over 1 hour drops below 99.5% (adjust to taste).
   - Action: Slack channel or email. (User configures the integration in Sentry → Integrations.)
   - Apply to the `react-native` project under the `runwae` org.

**Verification:** Trigger a manual crash in a development build (`throw new Error('test')` in a Pressable handler). Confirm the crash appears in Sentry with the correct release tag. Confirm the alert fires.

---

### 7. OTA channel verification

**Why:** `expo-updates` is configured (`runtimeVersion.policy: 'appVersion'` in [`app.config.ts:68-70`](../apps/mobile/app.config.ts)) and EAS profiles map to channels (`development`, `preview`, `production` per [`eas.json:11,25,41`](../apps/mobile/eas.json)). What needs verification: that a production OTA update only reaches production builds, and that the channel-to-build-profile mapping survives the prebuild step.

**Files to verify (no edits expected):**

- [`apps/mobile/app.config.ts`](../apps/mobile/app.config.ts) line 68–70 — `runtimeVersion` policy.
- [`apps/mobile/eas.json`](../apps/mobile/eas.json) — each build profile's `channel` field.

**Step-by-step:**

1. Read both files and verify:
   - `runtimeVersion: { policy: 'appVersion' }` — this ties OTA updates to the native app version. A user on app version `0.8.6` only receives updates published for `0.8.6`.
   - Each EAS build profile has a `channel` set (`development`, `preview`, `production`).
2. Publish a test update to the preview channel: `eas update --branch preview --message "OTA test"`. Open a preview build, force-close, reopen. The update should download.
3. Publish an update to production: `eas update --branch production --message "OTA test"`. Verify the preview build does NOT pick it up.
4. Document the OTA flow in `docs/mobile-ota-updates.md` (create if it doesn't exist):
   - When to ship via OTA vs a new build (JS-only changes → OTA; native module changes → build).
   - The `eas update` command.
   - How to roll back (`eas update --branch production --message "rollback" --republish`).

**Verification:** A preview-channel update is invisible to production builds. A production-channel update reaches production builds within ~30 seconds of next app open.

---

## Reference files

| Path | Purpose |
|---|---|
| [`apps/mobile/app.config.ts`](../apps/mobile/app.config.ts) | App config — plugins, ios/android sections, permission strings |
| [`apps/mobile/eas.json`](../apps/mobile/eas.json) | EAS build + submit profiles |
| [`apps/mobile/app/_layout.tsx`](../apps/mobile/app/_layout.tsx) | Root layout — where `Sentry.init` lives, where to register the Apple revoke listener |
| [`apps/mobile/components/auth/SocialAuthButtons.tsx`](../apps/mobile/components/auth/SocialAuthButtons.tsx) | Renders Apple + Google buttons (already wired, needs entitlement) |
| [`packages/convex/convex/auth.ts`](../packages/convex/convex/auth.ts) | Apple provider already configured at line 90 |
| `apps/mobile/.env` | Sentry auth token + Stripe keys (LOCAL ONLY — gitignored) |
| `docs/launch-readiness-spec.md` | Full launch plan (Phase 3 section starts ~line 95) |

---

## Required user actions (Phase 3 cannot complete without these)

1. **App Store Connect** → toggle "Sign in with Apple" capability on the App ID for `app.runwae.io` (one-time).
2. **App Store Connect** → fill in App Privacy questionnaire using the `docs/privacy-data-collection.md` inventory; declare ATT exempt.
3. **App Store Connect** → set Privacy Policy URL.
4. **Play Console** → create app listings for `app.runwae.io` + `app.runwae.preview`. Create service account, download JSON key, store as EAS secret or local file.
5. **Play Console** → fill in Data Safety form (mirror App Store Privacy).
6. **Play Console** → set Privacy Policy URL.
7. **Sentry dashboard** → create crash-free-session alert rule, wire to Slack/email.
8. **Hosted policies** → confirm or write finalized privacy policy and ToS content; host at `runwae.io/privacy` and `runwae.io/terms` (or wherever marketing site lives).
9. **Pending from earlier phases** — rotate Sentry auth token; verify `pk_live_*` Stripe key intent; provide `EXPO_PUBLIC_POSTHOG_KEY` (when Phase 2.5 starts).

---

## Phase 3 verification checklist

Mark each green before declaring Phase 3 done:

- [ ] TestFlight build presents native Apple Sign-In sheet → creates user row in Convex
- [ ] Apple credential revoke (iOS Settings → Apps Using Apple ID) signs user out on next app open
- [ ] `eas submit --platform android --profile production --no-wait` authenticates and starts upload
- [ ] Location permission prompt shows the specific, app-context copy
- [ ] App Store Connect → App Privacy section filled in completely, ATT exempt declared
- [ ] Play Console → Data Safety filled in completely
- [ ] Privacy Policy URL responds 200 from a non-authenticated `curl -I`
- [ ] Terms of Service URL responds 200 from a non-authenticated `curl -I`
- [ ] Sentry crash with manual `throw` appears in dashboard with correct release tag
- [ ] Sentry alert rule fires on simulated low crash-free-session rate (use Sentry's "test alert" feature)
- [ ] OTA update on preview channel does NOT reach production builds, and vice versa
- [ ] `eas build --profile preview --platform ios` succeeds end-to-end

---

## What comes after Phase 3

- **Phase 2.5 continuation** (parallel with Phase 3): install `i18next`/`expo-localization` on mobile, `next-intl` on web; build the locale picker UI in Profile → Appearance; convert `formatCurrency`/`formatDate` to locale-aware versions.
- **Phase 4**: auth polish — verify Google + Apple end-to-end on iOS/Android, email-verification smoke test.
- **Phase 5**: web placeholder pages (real `/t/[slug]` and `/d/[slug]`, dynamic Home hero).
- **Phase 6**: headline features (Discover Grid → Sectioned Experiences → Trip-from-link), all flag-gated.

Refer to [`docs/launch-readiness-spec.md`](launch-readiness-spec.md) for the full plan and risk register.

---

## How to brief the next Claude session

Open a new Claude Code session with this prompt:

> Please read `docs/phase-3-handover.md` end-to-end, then start executing Phase 3 deliverable #1 (Apple Sign-In iOS entitlement). I will handle the App Store Connect side. Work on `mobile/prepare-for-launch` (the branch that just merged to main — or branch from `main` since PR #23 is now merged).

That's it. The handover is self-contained.
