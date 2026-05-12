# Runwae Beta Test Guide

Thanks for helping us shake out bugs before launch. This doc walks you through what to try and how to report what you find. It should take **15–30 minutes** to run through the core flows, plus as long as you want to wander.

You don't need to be technical. If anything is confusing in this guide, that itself is feedback — let us know.

---

## Before you start

You'll need:

- An iPhone running iOS 16 or later
- The Runwae **Preview** build installed via TestFlight (we'll send you the invite link)
- A few minutes to make a test account, or the credentials of an existing account if you have one

Optional but useful:

- A second device or a friend's account, if you can get one — some flows are easier to test with two people (e.g. trip invites)
- A working Apple ID with Sign in with Apple enabled

---

## What we most want to know

Three things, in order of importance:

1. **Did anything crash, freeze, or hang?** Even for a moment. Especially after you tap a button and nothing happens.
2. **Did anything look wrong?** Misaligned buttons, weird colors, text in the wrong language, an icon at the wrong size, blurry images.
3. **Did anything confuse you?** A label that didn't match what happened, a button you tapped that didn't do what you expected, a screen you didn't know how to leave.

For each issue, please tell us:

- What you were doing (or trying to do)
- What you expected to happen
- What actually happened
- A screenshot or screen recording if you can get one (Settings → Camera → Record Screen, or just send a screenshot)
- The model of your iPhone and the iOS version (Settings → General → About)

Send the report to **[email/slack channel TBD]**.

---

## Test scenarios

These are roughly ordered by importance — if you only have 10 minutes, do the first three.

### 1. Sign-in works

Try to sign in three different ways. Each way should land you on the **Home** tab (with the trip cards) if you're an existing user, or on a **5-step setup flow** if you're brand new.

#### 1a. Sign in with Apple

1. From the welcome screen, tap **"Continue with Apple"**.
2. iOS shows you a native sheet with your Apple ID.
3. Choose **Share My Email** OR **Hide My Email** — try both, in two separate test runs if possible.
4. Confirm with Face ID / Touch ID.

**Expected:** You're signed in. The button stops spinning. You see either the Home tab or the 5-step setup.

**Things to flag:**

- Spinner that never stops (we just fixed this, but report if it comes back).
- Sign-in completes but you land on the **wrong** screen (e.g. you're an existing user but you see the 5-step setup again).
- Different Apple ID gives you the same account as another tester (would mean accounts are getting mixed up).
- The Apple sheet doesn't appear at all.

#### 1b. Sign in with Google

1. Tap **"Continue with Google"**.
2. A browser sheet opens with Google's sign-in page.
3. Pick your account, approve the permission.
4. The browser closes and you're back in the app.

**Expected:** Signed in.

**Things to flag:**

- Spinner that never stops.
- Browser closes but you're still on the welcome screen.
- Google account chooser doesn't appear (you should always be asked which account, even if you've signed in before).

#### 1c. Sign in with email + password

1. From the welcome screen, tap **"Sign in"**.
2. Enter the credentials of a known account.
3. Tap submit.

**Expected:** Signed in.

**Things to flag:**

- "Wrong password" when you're sure it's right.
- Form gives no feedback (no error, no spinner, nothing happens when you tap submit).

---

### 2. Sign-up + email verification works (new accounts only)

1. From the welcome screen, tap **"Sign up"**.
2. Enter an email you control and any password.
3. You should be sent a 6-or-8-digit code by email within 30 seconds.
4. Enter the code in the app.

**Expected:** Account is created, you go through the 5-step setup, then land on Home.

**Things to flag:**

- Code email doesn't arrive within 2 minutes.
- Code is rejected even when you enter it correctly.
- After entering the code, nothing happens.
- The 5-step setup gets stuck on a step or skips a step.

---

### 3. Sign-out works

1. Open the **Profile** tab.
2. Find **Settings → Sign out**.
3. Tap it.

**Expected:** You're returned to the welcome screen. No content from your account is visible.

**Things to flag:**

- App shows your data briefly before signing you out (a privacy leak).
- Pressing the back button after signing out lets you see your old screens.
- Signing back in puts you somewhere unexpected (e.g. the 5-step setup again instead of Home — we just fixed this, but report if it comes back).

---

### 4. Apple credential revoke (iOS-specific edge case)

This one's a bit fiddly but important. Only do this if you signed in with Apple in step 1a.

1. Open iOS **Settings** app.
2. Go to **Apple ID (your name at top) → Sign in with Apple**.
3. Find **Runwae** in the list, tap it, tap **Stop Using Apple ID**.
4. Confirm.
5. Now reopen the Runwae app.

**Expected:** Within a second of opening, you're signed out and back at the welcome screen.

**Things to flag:**

- App still shows your account as if nothing happened.
- App crashes when you reopen.
- App freezes.

After this test, you can sign back in normally to keep using the app.

---

### 5. Trips — create, view, share, delete

#### 5a. Create a trip

1. Home tab → tap the **"+ Create trip"** button (or whatever the primary CTA is).
2. Pick a destination (try one with a long name, e.g. "St. Petersburg" or "São Paulo").
3. Pick dates — try a 1-day trip, a 5-day trip, and a 30-day trip in three separate runs.
4. Save / create.

**Expected:** Trip appears in your list with the right destination, dates, and an image.

**Things to flag:**

- Image is a generic placeholder when it shouldn't be.
- Dates show as "NaN" or wrong timezone (e.g. you picked May 12 but it shows May 11).
- Special characters in destination names render weird (e.g. "São Paulo" shows "São Paulo").
- Trip doesn't save — you go back to the list and it's not there.

#### 5b. View a trip

1. Tap a trip from your list.
2. Scroll through it.

**Expected:** You see the itinerary, the cover image, and any items you've added.

**Things to flag:**

- Sections that load slowly (>3 seconds is slow).
- Images that load broken or zero-sized.
- Buttons / icons that overflow off the side of the screen.

#### 5c. Share / invite to a trip

1. From inside a trip, find the **invite** option.
2. Get the invite link or join code.
3. (If you have a second account) try joining from that account.

**Expected:** The second account is now a member and sees the trip.

**Things to flag:**

- Invite link doesn't work / opens a 404.
- Join code is rejected.
- Member doesn't appear after joining.

#### 5d. Delete a trip

1. From the trip detail, find the delete option (probably in a menu).
2. Confirm.

**Expected:** Trip disappears from your list and is gone.

**Things to flag:**

- Trip reappears on next refresh.
- App crashes on delete.

---

### 6. Events / discover

1. Open the **Explore** or **Events** tab.
2. Browse around.
3. Tap a few cards.

**Expected:** You see lists of nearby trips, events, experiences. Cards open detail screens.

**Things to flag:**

- Lists never load (just a skeleton or spinner).
- "Nearby" content is for the wrong city (we'll set your home location separately).
- Detail screens fail to load specific events.

---

### 7. Location permission

The first time you tap **"Use my location"** or open a screen that needs your location, iOS asks permission.

**Expected:** The system prompt's text reads:

> "Runwae uses your location to suggest nearby trips, events, and experiences on your home feed."

**Things to flag:**

- A different / generic prompt text.
- Crash when you grant or deny.
- App still asks repeatedly even after you've granted or denied.

---

### 8. Profile + settings

1. Profile tab → look at the various entries (Edit profile, Notifications, About, Privacy Policy, Terms of Service, Sign out).
2. Tap each one and look at the screen briefly. You don't need to fill anything out — just confirm each opens.

**Expected:** Every entry leads somewhere reasonable. Privacy Policy and Terms of Service either open in-app or open in a browser to a real-looking policy page.

**Things to flag:**

- A row that opens a blank screen.
- A "Privacy Policy" or "Terms of Service" link that goes nowhere.
- An icon that's the wrong color or size.

---

### 9. Push notifications

If you've granted notification permission, try to trigger one. The easiest is:

1. Have a friend invite you to a trip (or vice versa).
2. Within a minute, you should get a push notification.

**Expected:** The notification appears on the lock screen / notification center, and tapping it opens the right screen in the app.

**Things to flag:**

- Notification text reads "you have a new notification" or similar generic copy.
- Tapping the notification opens the wrong screen (e.g. Home instead of the trip).
- Notification arrives much later than expected.

---

### 10. Sloppy bits — visual polish

Open the app in **Light mode** AND **Dark mode** (Settings → Display & Brightness on iOS) and look for:

- Text that's hard to read (low contrast, e.g. white-on-pale-pink or grey-on-grey).
- Buttons that overflow the screen edge.
- Icons or images that load late and "pop in".
- Animations that stutter or feel jumpy.
- Pink splash screen flashing briefly between sign-in and Home (we know about this, just confirm it's gone in the latest build).
- Two different fonts on the same screen.
- Inconsistent corner radius / shadow style.
- Anything that looks like a placeholder ("lorem ipsum", "TODO:", "Untitled").

---

## Reporting bugs

For each bug, copy this template:

```
Build version: (Settings → About → Build number, or just "latest TestFlight as of <date>")
iOS version + device: (e.g. iPhone 14 Pro / iOS 17.5)
What I was doing: (e.g. "tapping Continue with Apple from a fresh install")
What I expected: (e.g. "to be signed in and see the Home tab")
What actually happened: (e.g. "the spinner kept spinning for 30+ seconds and nothing happened")
Screenshot / video: (attached, or "none")
```

Send to **[email/slack channel TBD]**. We triage every report — if we don't reproduce it, we'll come back with questions.

---

## What you can SKIP

- Anything that explicitly says **"Beta"** or **"Coming soon"** — those aren't ready.
- Web app (`runwae.io`) — not part of this beta.
- Android — not yet.
- Buying anything with real money — Stripe is in test mode, and any "purchase" you complete will be reversed; please don't try to actually pay for things.

---

## Thanks

Seriously, thank you. Bugs found in beta are 10× cheaper to fix than bugs found after launch, and an order of magnitude less painful for users.

---

# Appendix — Technical notes (Chris-only)

**Build artifact:** TestFlight `Preview - Runwae` (bundle `app.runwae.preview`, ASC App ID `6768457769`). Runtime version `0.8.7`. EAS channel `preview`.

**Convex deployment under test:** `joyous-yak-612` (your personal dev). Auth env: `AUTH_APPLE_ID=app.runwae.io`, `AUTH_APPLE_SECRET=<JWT>`, `AUTH_APPLE_AUDIENCES=app.runwae.io,app.runwae.preview,app.runwae.dev`, `AUTH_GOOGLE_ID`/`SECRET` set.

**Auth providers wired:**
- `apple-native` — custom ConvexCredentials provider in [`packages/convex/convex/lib/appleNative.ts`](../packages/convex/convex/lib/appleNative.ts). Validates Apple identity tokens against `appleid.apple.com/auth/keys` JWKS via `jose`. Uses `shouldLinkViaEmail` for verified non-relay emails so existing password accounts auto-link.
- `apple` — OIDC provider, **dormant** until web Apple sign-in ships.
- `google` — OAuth code-exchange via `WebBrowser.openAuthSessionAsync`.
- `password` — email + password with OTP verification via Resend.

**Recently shipped (Phase 3 #1):**
- Native Apple sheet on iOS via `expo-apple-authentication.signInAsync()`.
- `useAppleCredentialsRevoke` hook mounted in `RouteGuard` listens for iOS revocation events.
- `apple-signin/<step>` Sentry breadcrumbs in `signInWithApple` for hang diagnosis. **Remove these** once the launch is stable — they'll noise up the Sentry feed.
- Server-side fix: catch `InvalidAccountId` thrown by `retrieveAccount` (lib's docstring/behavior mismatch).
- Server-side fix: sync `viewer.onboardingComplete` → local `hasCompletedBoarding` SecureStore flag on auth, so existing users skip the boarding flow.

**Known issues to flag in tester reports:**
- Pink splash flashes briefly after sign-in. Tracked in next planned commit.
- Sentry `apple-signin/*` info events appear on every sign-in attempt — debug instrumentation, not user-facing bugs.

**What's NOT in the beta yet:**
- PostHog product analytics (Phase 2.5).
- Android (Phase 3 #2 blocked on Play Console listing + service account JSON).
- Hosted Privacy Policy + Terms URLs (Phase 3 #5 blocked on legal text).
- App Store Connect privacy questionnaire submission (Phase 3 #4 doc-only; needs `docs/privacy-data-collection.md` populated into ASC by you).
- Sentry crash-free-session alert rule (Phase 3 #6 doc-only on the dashboard side).
- Production Convex deployment (`AUTH_APPLE_AUDIENCES` + apple-native provider not yet pushed there — set the env + run `npx convex deploy --prod` once preview is signed off).

**For testers reporting auth issues:** if a tester's "spinner spins forever" report comes in, first check Sentry → Issues for `apple-signin/*` events from their session. The breadcrumbs tell you which await never returned. The instrumentation lives at [`apps/mobile/hooks/useAuth.ts`](../apps/mobile/hooks/useAuth.ts) under `signInWithApple`'s `breadcrumb()` helper.

**For "wrong account on sign-in" reports:** check whether Apple shared a relay email (`@privaterelay.appleid.com`). If so, the `apple-signin-relay-email` Sentry event in [`apps/mobile/hooks/useAuth.ts`](../apps/mobile/hooks/useAuth.ts) fires. Relay-email users will always create a fresh account — there is no way to link them to a real-email account because Apple doesn't expose the underlying email. Document this in your account-linking decision in Phase 4+.
