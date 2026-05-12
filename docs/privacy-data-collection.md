# Privacy Data Collection Inventory

Source of truth for what user data Runwae collects, where it goes, and who has access. Use this when filling in:

- **App Store Connect → App Privacy** (the "Privacy Practices" / Nutrition Labels questionnaire)
- **Play Console → App content → Data safety** (the equivalent on Android)
- Anything else that asks "what data does your app collect and share."

This is an engineering inventory, not legal copy. Hand it to your lawyer or privacy reviewer for the user-facing privacy policy.

Last verified against the codebase: 2026-05-11 (Phase 3).

## ATT (App Tracking Transparency)

**Runwae is ATT-exempt.** We do not:

- Collect IDFA or any cross-app/cross-site identifier.
- Integrate with any third-party advertising SDK.
- Share device or user identifiers with data brokers.
- Link user data to data from other apps, websites, or offline sources for advertising purposes.

When you submit, **declare ATT exempt** and **do NOT add `NSUserTrackingUsageDescription` to `Info.plist`**. Adding it would mistakenly trigger the ATT prompt for users.

## Required permissions

| iOS permission | Why we request it | User-facing copy |
|---|---|---|
| `NSLocationWhenInUseUsageDescription` | Set home location to suggest nearby trips/events/experiences on the home feed | "Runwae uses your location to suggest nearby trips, events, and experiences on your home feed." (`apps/mobile/app.config.ts:77-78`) |
| Push notifications | Trip invites, event reminders, booking confirmations | System default (no custom string for the prompt itself) |
| Photo library (camera roll) | Profile photo and trip cover image uploads | System default |

Android: equivalent runtime permissions for `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` (declared in `app.config.ts:124-127`).

## Data collectors

Every external system that receives or stores user data. **Linked to user** = the data can be tied back to a specific Runwae account.

| Collector | Data types | Purpose | Linked to user? | Used for tracking? | Code reference |
|---|---|---|---|---|---|
| **Convex** (our primary backend) | Email, name, username, avatar URL, locale, currency preference, home location (city/country/coords/IATA), trips, events, polls, bookings, expenses, friendships, posts, push tokens | Provide all app functionality | Yes | No | `packages/convex/convex/schema.ts` |
| **Stripe** | Payment card token, billing address, transaction history | Process payments + payouts | Yes | No | `@stripe/stripe-react-native` on mobile, `stripe@17.7.0` in `packages/convex/convex/` |
| **Apple Sign-In** | Apple ID identity token (sub + optionally email + optionally name) | Authentication | Yes | No | `apps/mobile/hooks/useAuth.ts:signInWithApple` |
| **Google Sign-In** | Google account email, name, profile picture | Authentication | Yes | No | OAuth flow via `@convex-dev/auth` Google provider |
| **Sentry** | Crash reports, performance traces, stack traces, breadcrumbs, release/dist version, OS version, device model. Tagged with internal user ID when set via `Sentry.setUser`; we do not call that today, so events are currently anonymous device-level. | Bug fixing | Anonymous device-level today; will become user-linked when we wire `Sentry.setUser` | No | `apps/mobile/lib/sentry.ts` |
| **Resend** | Recipient email address, OTP / reset code body | Send verification + password-reset emails | Yes | No | `packages/convex/convex/lib/email.ts` |
| **Expo (push notification gateway)** | Device push token, notification payload, app version | Deliver push notifications via APNs/FCM | Yes (token ↔ user mapping stored in Convex) | No | `apps/mobile/lib/pushNotifications.ts`; backend POSTs to `https://exp.host/--/api/v2/push/send` |
| **Expo (EAS Update CDN)** | App version, OTA bundle ID, manifest fetch (anonymous) | Deliver JS-only updates | No | No | `apps/mobile/app.config.ts:225-230` |
| **OpenStreetMap Nominatim** | Lat/lng coordinates of the user's home location, sent at the moment they tap "Use my location" | Reverse-geocode coords into a city/country label | Anonymous (no API key, no headers identifying the user) | No | `apps/mobile/components/home/LocationPrompt.tsx`, `apps/mobile/hooks/useGeocode.ts` |
| **LiteAPI** (hotel inventory) | Anonymized search params (destination, dates, party size). No user identifier is forwarded. | Hotel availability + booking | No (no user-id forwarded) | No | `packages/convex/convex/` — hotels integration |
| **Geoapify** (POI fallback) | Anonymized geo query (lat/lng + radius) | Fall back POI data for destinations the primary providers don't cover | No (no user-id forwarded) | No | `packages/convex/convex/discovery.ts` |
| **Apple Maps / Google Maps** (via `expo-maps`) | Lat/lng of points being rendered; per Apple/Google SDK telemetry | Map rendering on event detail screen | Per Apple/Google SDK behaviour — see their policies | No | `apps/mobile/components/event/LocationMap.tsx` |

## Not currently integrated (flag if/when added)

- **PostHog** — planned for Phase 2.5 (product analytics + session replay). Will collect product-interaction events; linked to user ID. Not for tracking across apps.
- **UploadThing** — referenced in `CLAUDE.md` for file uploads but not yet in `package.json`. When wired, add a row for it: file metadata + binary content.
- **Anthropic API** — used for backend-only LLM features (e.g. AI trip planning via `convex/ai.ts`); when invoked, trip context (destinations, dates, preferences) is sent to Anthropic. Not currently called from any user-facing flow in mobile.
- **Viator** — referenced in mobile code paths (`experience/[id]`) but unclear if live or stub. Verify before submitting.

## Account deletion

App Store policy: in-app account deletion is mandatory for apps that support account creation.

**Status:** verify whether Profile → Settings → "Delete account" exists. If not, this is a launch blocker — Apple will reject submissions without it. (Out of scope for Phase 3 but worth surfacing.)

## Encryption export compliance

Runwae uses standard iOS HTTPS / TLS only — no proprietary crypto. In App Store Connect, declare:

- **"Does your app use encryption?"** Yes (standard iOS encryption).
- **"Does your app qualify for any of the exemptions in Category 5, Part 2?"** Yes (uses only HTTPS / standard TLS).
- This avoids the annual CCATS filing requirement.

## Verification checklist before App Privacy submission

- [ ] Every "collector" row above still matches code; remove any that are no longer integrated.
- [ ] No new third-party SDKs were added without updating this doc. Grep `package.json` for SDK names that aren't in the table.
- [ ] Account deletion flow exists (see "Account deletion" above).
- [ ] `NSUserTrackingUsageDescription` is NOT present in `Info.plist` (verifies ATT exemption posture).
- [ ] Privacy Policy URL is set on Privacy Policy section in ASC + Play Console (Phase 3 #5).
