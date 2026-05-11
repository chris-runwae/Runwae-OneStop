# Phase 3 Deliverable #1 — Apple Sign-In iOS (Native Sheet + Revoke Listener)

## Context

PR [#23](https://github.com/chris-runwae/oneStop/pull/23) landed the Sign-in-with-Apple groundwork: `ios.usesAppleSignIn: true`, the `expo-apple-authentication` Expo plugin, the dependency itself (`~8.0.8`), and an Apple button that renders on iOS via [`SocialAuthButtons.tsx:71`](../apps/mobile/components/auth/SocialAuthButtons.tsx). The Convex Apple provider is already configured ([`packages/convex/convex/auth.ts:82`](../packages/convex/convex/auth.ts)).

Two gaps remained before TestFlight, both addressed here:

1. **The Apple flow was not native.** [`useAuth.ts:394`](../apps/mobile/hooks/useAuth.ts) routed `signInWithApple` through `runOAuthFlow("apple")`, which opened `WebBrowser.openAuthSessionAsync` — a web-based OAuth flow. Apple HIG and App Review require the native `AuthenticationServices` sheet on iOS when an app advertises Sign in with Apple. Web OAuth is the most common reason "SIWA" submissions get rejected, despite the entitlement being correct.
2. **No credential-revoke listener.** If a user revokes Runwae's Apple credential in iOS Settings → Apple ID → Apps Using Apple ID, the app must sign them out on next launch. Without listening for the revoke event, the session lingers and the user sees a confusing zombie state.

The iOS Apple flow is now the native sheet (web OAuth deleted from the iOS path since the Apple button is iOS-only) and the revoke listener is wired. The Convex Apple provider stays as-is; we hand it the identity token from the native sheet via `signIn("apple", { id_token })`.

---

## File map

| File | Change |
|---|---|
| [`apps/mobile/hooks/useAuth.ts`](../apps/mobile/hooks/useAuth.ts) | Replaced web-OAuth Apple path with native `AppleAuthentication.signInAsync()` → `convexSignIn("apple", { id_token })`. `runOAuthFlow` remains for Google. |
| [`apps/mobile/hooks/useAppleCredentialsRevoke.ts`](../apps/mobile/hooks/useAppleCredentialsRevoke.ts) | New hook. Registers `AppleAuthentication.addRevokeListener` and calls the consumer `signOut` from `AuthContext` when fired. Separate file so it can consume `@/context/AuthContext`'s `useAuth` consumer without recursing into the impl-hook in `hooks/useAuth.ts`. |
| [`apps/mobile/app/_layout.tsx`](../apps/mobile/app/_layout.tsx) | Calls `useAppleCredentialsRevoke()` inside `RouteGuard` — that component is mounted under `AuthProvider`, so the context consumer resolves correctly. |

No changes in `app.config.ts`, `package.json`, `SocialAuthButtons.tsx`, or `convex/auth.ts` — those were already correct after PR #23.

> **Note on the package API:** the original handover doc referenced `useCredentialsRevokedListener`. The actual export in `expo-apple-authentication@8.0.8` is `addRevokeListener` (returns an `EventSubscription`). The hook uses that.

---

## User actions

These are required for Phase 3 #1 to be fully complete; they don't block the engineering work above.

1. **App Store Connect → Certificates, IDs & Profiles → Identifiers** → find the App IDs `app.runwae.io` (production), `app.runwae.preview` (preview), and `app.runwae.dev` (dev). For each, confirm **Sign in with Apple** capability is checked. One-time setup per bundle ID.
2. **App Store Connect → Services → Sign in with Apple for Email Communication** → register `noreply@<your-relay-domain>` if you plan to email users who chose Apple's email relay. Optional now; required before sending transactional email to Apple-relay addresses.
3. **Verify Convex env vars** on the production deployment: `AUTH_APPLE_ID` (Services ID, e.g. `app.runwae.signin`), `AUTH_APPLE_SECRET` (the JWT client secret, max 6 months — set a calendar reminder to rotate). Already documented at [`packages/convex/convex/auth.ts:75-81`](../packages/convex/convex/auth.ts).

---

## End-to-end verification

Mark each green before declaring deliverable #1 done:

- [x] `pnpm --filter runwae-mobile typecheck` clean on the edited files (one pre-existing error in `packages/convex/convex/auth.ts:14` is unrelated)
- [ ] `eas build --profile preview --platform ios` succeeds, build log shows `expo-apple-authentication` linked
- [ ] On the preview build (TestFlight or dev client): tapping "Continue with Apple" shows the **native iOS sheet** (Face ID / Touch ID prompt, no web browser)
- [ ] After successful sign-in, a new row appears in the Convex `users` table with the Apple-relay email
- [ ] `lastAuthMethod` SecureStore key contains `"apple"` after sign-in
- [ ] Revoke the credential: iOS Settings → Apple ID → Password & Security → Apps Using Apple ID → Runwae → **Stop Using Apple ID**
- [ ] Foreground the app; user is signed out (lands on onboarding/auth route per `RouteGuard`)
- [ ] No Sentry errors tagged `source: "apple-credentials-revoked"` appear in the dashboard during the revoke test

---

## Out of scope

- The web app's Apple sign-in flow at [`apps/web`](../apps/web). The handover scopes Phase 3 to mobile.
- The Sentry release-tagging in `Sentry.init` — that's deliverable #6.
- Android Apple sign-in. Not on the Phase 3 list.
- Rotating Apple JWT client secret. User action, calendar-reminder territory.
