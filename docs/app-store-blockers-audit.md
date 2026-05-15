# App Store Blockers Audit

Snapshot as of this session. The two known-blocker items from the punch
list are already in tree — they don't need new work.

## ✅ Apple Sign-In + credential revoke listener

Required by **App Store Review Guideline 4.8**: any app that offers a third-party
or social login (Google in our case) must also offer Sign in with Apple, and must
react to credential revocation.

- Plugin enabled: [app.config.ts:176](apps/mobile/app.config.ts:176) — `'expo-apple-authentication'`.
- `usesAppleSignIn: true` flag set: [app.config.ts:80](apps/mobile/app.config.ts:80).
- Native sign-in flow lives at [hooks/useAuth.ts:499-554](apps/mobile/hooks/useAuth.ts:499)
  (`AppleAuthentication.signInAsync` with FULL_NAME + EMAIL scopes; handles the
  `ERR_REQUEST_CANCELED` user-cancel case).
- Server-side Apple provider wired: [packages/convex/convex/auth.ts:112](packages/convex/convex/auth.ts:112) (`AppleNative`).
- Revoke listener mounted at app boot: [hooks/useAppleCredentialsRevoke.ts](apps/mobile/hooks/useAppleCredentialsRevoke.ts)
  + invoked from [app/_layout.tsx:99](apps/mobile/app/_layout.tsx:99) — calls
  `AppleAuthentication.addRevokeListener` and signs the user out when iOS
  posts the credentials-revoked notification.

**Status: complete.** Verify in TestFlight by signing in with Apple, then
revoking the app from iOS Settings → Apple ID → Apps Using Apple ID, then
re-opening the app. Expected: drops to sign-in screen on next foreground.

## ✅ Account deletion (Guideline 5.1.1(v))

Required for any app that supports account creation: deletion must be
**reachable from within the app** (not just via email/web), and must
delete data (not just deactivate).

- UI entry point: Profile → Security → "Delete account" at
  [profile/security/index.tsx:25-28](apps/mobile/app/(tabs)/profile/security/index.tsx:25).
- Delete screen: [profile/security/delete-account.tsx](apps/mobile/app/(tabs)/profile/security/delete-account.tsx).
- Server-side flow ([convex/account_deletion.ts](packages/convex/convex/account_deletion.ts)):
  - `getDeletionBlockers` surfaces pending/confirmed bookings and active
    subscriptions so the user can resolve them first.
  - `requestAccountDeletion` soft-deletes with a 30-day recovery window
    (`RECOVERY_WINDOW_DAYS = 30`).
  - `restoreAccount` undoes the soft-delete if the user signs back in
    within the window.
  - Stripe subscription auto-cancel is dispatched via
    `internal.payments.cancelStripeSubscription`.
  - Hard-delete cron runs daily ([crons.ts:13-19](packages/convex/convex/crons.ts:13))
    via `account_deletion.runScheduledDeletions`.
  - Financial records (bookings, commissions, payouts) are re-pointed at
    a system sentinel user rather than dropped — preserves audit trail
    while honouring deletion intent.

**Status: complete.** The 30-day recovery window is permitted under Apple's
guidelines provided the user is told about it (the dialog at
[delete-account.tsx:35](apps/mobile/app/(tabs)/profile/security/delete-account.tsx:35)
already explains this).

## ✅ Location permissions

- iOS: `NSLocationWhenInUseUsageDescription` set at [app.config.ts:77](apps/mobile/app.config.ts:77)
  — "Runwae uses your location to suggest nearby trips, events, and
  experiences on your home feed."
- Android: `ACCESS_COARSE_LOCATION` + `ACCESS_FINE_LOCATION` declared at
  [app.config.ts:127-129](apps/mobile/app.config.ts:127).
- expo-maps plugin sets the runtime prompt copy at
  [app.config.ts:162-169](apps/mobile/app.config.ts:162).

**Status: complete.** App Review's only sensitivity here is whether the
string truthfully explains the purpose — ours does.

## Open items (not blockers, but flag before submit)

### TIQETS_KEY missing — international event coverage gap

Confirmed by smoke-testing today: Ticketmaster has **zero** events for Portugal
(`totalElements=0` from their API). Tiqets is the configured fallback but
`TIQETS_KEY` isn't set in the Convex env. Lisbon (and other non-TM markets)
fall through to the 2-item static seed. Will fail any App Review reviewer who
searches a non-US/UK city.

**Two paths:**
1. Sign up at [tiqets-affiliates.com](https://tiqets-affiliates.com/affiliate-api/),
   add `TIQETS_KEY` to the Convex env. ~10 min.
2. Or add Eventbrite as another fallback (their public-events endpoint
   doesn't require a paid plan for basic queries). ~half a day.

### Apple submit profile

`eas.json` has iOS submit profiles for both `production` and `preview`. No
gap. Android deferred per earlier conversation.

### Other Apple checks worth running before submission

These don't have code touchpoints but are easy to miss:

- **App Privacy "Data Linked to You" form** — make sure email, name,
  location, payment-related data are declared.
- **App Tracking Transparency** — we don't currently use any cross-app
  tracking SDKs, so the prompt isn't needed. Don't add one unless we
  introduce tracking.
- **Sensitive permission justification strings** — already done for
  location; if camera/photo-library are added later, those need strings too.
- **In-app purchase guidance** — Stripe is used for real-world goods
  (hotels, flights), which is allowed. No IAP required.
- **"Restore previous purchase"** — only applies to apps with IAP, n/a.
