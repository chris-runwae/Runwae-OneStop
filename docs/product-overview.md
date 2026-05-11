# Runwae — Product Overview & Platform Audit

> Generated 2026-05-11. Covers the full monorepo: mobile app, consumer web app, admin console, host dashboard, and Convex backend.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Platform Architecture](#2-platform-architecture)
3. [Mobile App (apps/mobile)](#3-mobile-app-appsmobile)
4. [Consumer Web App (apps/web)](#4-consumer-web-app-appsweb)
5. [Admin Console (apps/admin)](#5-admin-console-appsadmin)
6. [Host Dashboard (apps/hosts)](#6-host-dashboard-appshosts)
7. [Convex Backend (packages/convex)](#7-convex-backend-packagesconvex)
8. [Legacy Systems](#8-legacy-systems)
9. [Mobile Launch Readiness Checklist](#9-mobile-launch-readiness-checklist)
10. [Issues & Problems Found](#10-issues--problems-found)

---

## 1. Executive Summary

**Runwae** is a social trip-planning platform that lets users discover destinations, plan collaborative trips with friends, book flights/hotels/experiences, attend events, and share itineraries. The platform spans four apps:

| App | Stack | Status | Audience |
|-----|-------|--------|----------|
| Mobile App | Expo 54 + React Native 0.81 | Most mature — ~104 screens | B2C consumers |
| Consumer Web | Next.js 15 App Router | Active development | B2C consumers |
| Admin Console | Next.js 15 + shadcn/ui | Recently built | Internal (founders) |
| Host Dashboard | Next.js 15 + shadcn/ui | Active development | Event hosts/vendors |

All apps share a **Convex** backend with 34+ tables, Convex Auth (Google OAuth + Password), and Stripe for payments.

**Business model:** Commission on bookings (flights via Duffel, hotels via LiteAPI, experiences via Viator), event ticket sales (Runwae ticketing with Stripe), and a planned Pro subscription tier.

---

## 2. Platform Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Turborepo Monorepo                     │
├──────────┬──────────┬──────────┬──────────┬──────────────┤
│ apps/    │ apps/    │ apps/    │ apps/    │ packages/    │
│ mobile   │ web      │ admin    │ hosts    │ convex       │
│ (Expo)   │ (Next)   │ (Next)   │ (Next)   │ (Backend)    │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴──────┬───────┘
     │          │          │          │            │
     └──────────┴──────────┴──────────┴────────────┘
                         │
                    ┌────┴────┐
                    │ Convex  │ ← Schema, Auth, Queries, Mutations, Actions
                    │ Cloud   │ ← Cron Jobs, File Storage
                    └────┬────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
     ┌────┴────┐   ┌────┴────┐   ┌────┴────┐
     │ Stripe  │   │ Duffel  │   │ Viator  │
     │ Payments│   │ Flights │   │ Tours   │
     └─────────┘   └─────────┘   └─────────┘
          │              │              │
     ┌────┴────┐   ┌────┴────┐   ┌────┴────┐
     │ LiteAPI │   │ Resend  │   │ Sentry  │
     │ Hotels  │   │ Email   │   │ Errors  │
     └─────────┘   └─────────┘   └─────────┘
```

### Shared packages

| Package | Purpose |
|---------|---------|
| `packages/convex` | Convex schema, auth, all backend logic (queries, mutations, actions, cron jobs) |
| `packages/ui` | Design tokens (`tokens.ts`) — colours, fonts. Component library is TBD |

---

## 3. Mobile App (`apps/mobile`)

### Overview

The most feature-rich surface. Built with **Expo 54**, **React Native 0.81**, **expo-router 6** (file-based routing), **NativeWind 4** (Tailwind for RN), and **Zustand** for local state. Version **0.8.6**.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo 54 (SDK 54, New Architecture enabled) |
| Navigation | expo-router 6 (file-based, typed routes) |
| Styling | NativeWind 4 (Tailwind CSS for React Native) |
| State | Zustand 5, React Context (AuthContext, TripsContext, BoardingContext) |
| Backend | Convex (via `@convex-dev/auth` + `convex` client) |
| Payments | Stripe React Native SDK 0.50.3 |
| Maps | expo-maps 0.12 |
| Lists | @shopify/flash-list 2.0 |
| Animations | react-native-reanimated 4.2, moti 0.30 |
| Bottom sheets | @gorhom/bottom-sheet 5.2 |
| Error tracking | Sentry (@sentry/react-native 8.2) |
| OTA updates | expo-updates (EAS Update) |
| Notifications | expo-notifications |
| Calendar | @marceloterreiro/flash-calendar |
| Icons | lucide-react-native |

### Navigation Structure

**5-tab layout** with floating tab bar (iOS 18+ uses native liquid-glass tabs):

| Tab | Route | Description |
|-----|-------|-------------|
| Home | `/(tabs)/index` | Feed of upcoming trips, events, experiences, friends activity, polls |
| Explore | `/(tabs)/explore` | Search + browse destinations, events, itineraries, public trips, Viator tours |
| Trips | `/(tabs)/(trips)` | My trips + joined trips, trip detail with itinerary/ideas/polls/expenses/posts |
| Create | `/(tabs)/create` | Trip creation chooser (manual, AI, from link) |
| Profile | `/(tabs)/profile` | User profile, settings, security, appearance, support, about/legal |

### Screens Inventory (104 screens)

#### Auth Flow (10 screens)
- `(auth)/onboarding` — Welcome/intro slides
- `(auth)/onboarding-steps` — Multi-step onboarding
- `(auth)/login` — Email + password login
- `(auth)/signup` — Email + password registration
- `(auth)/forgot-password` — Password reset request
- `(auth)/check-email` — "Check your email" confirmation
- `(auth)/reset-password` — New password entry
- `(auth)/reset-success` — Reset confirmation
- `(auth)/verification-sent` — Email verification notice
- `(auth)/email-confirmation` — Email confirmed

#### Boarding Flow (6 screens)
Post-signup onboarding wizard:
- `boarding/index` — Entry point
- `boarding/step-1` — Name & avatar
- `boarding/step-2` — Travel preferences (tags)
- `boarding/step-3` — Home location (city/airport)
- `boarding/step-4` — Currency preference
- `boarding/step-5` — Completion

#### Trip Management (8 screens)
- `(tabs)/(trips)/trip` — Trips list
- `(tabs)/(trips)/[tripId]/index` — Trip detail (tabbed: itinerary, ideas, polls, expenses, posts)
- `(tabs)/(trips)/[tripId]/edit` — Edit trip details
- `(tabs)/(trips)/[tripId]/add-expense` — Add expense to trip
- `(tabs)/(trips)/[tripId]/add-poll` — Create a poll
- `(tabs)/(trips)/[tripId]/add-post` — Add a post/update
- `create-trip/index` — Manual trip creation form
- `create-trip-options` — Creation method chooser (form sheet)

#### AI Trip Planning (2 screens)
- `create-trip-ai` — AI-powered trip generation from text prompt
- (Planned: `create-trip-from-link` — Generate trip from YouTube/TikTok URL)

#### Flights (5 screens)
- `flights/_layout` — Flights stack
- `flights/results` — Flight search results (Duffel API)
- `flights/book/passengers` — Passenger details form
- `flights/book/payment` — Stripe payment for flights
- `flights/book/confirmation` — Booking confirmation

#### Hotels (6 screens)
- `hotels-search/_layout`, `hotels-search/results`, `hotels-search/hotel` — Hotel search (LiteAPI)
- `hotels/_layout`, `hotels/[hotelId]/index`, `hotels/[hotelId]/room-detail` — Hotel detail
- `hotel/_layout`, `hotel/[hotelId]` — Hotel detail (alternate route)
- `hotel/book` — Hotel booking form
- `hotel/payment` — Stripe payment for hotels
- `hotel/confirmation` — Booking confirmation

#### Experiences (8 screens)
- `experiences-search/_layout`, `experiences-search/results`, `experiences-search/detail` — Experience search (Viator/Ticketmaster/Yelp/Tiqets)
- `experience/_layout`, `experience/index`, `experience/[id]` — Experience detail
- `viator/_layout`, `viator/index`, `viator/[productCode]` — Viator tour detail

#### Events (4 screens)
- `events/_layout`, `events/index`, `events/[id]` — Event listing and detail
- `events/featured` — Featured events

#### Destinations (3 screens)
- `destination/_layout`, `destination/index`, `destination/[id]` — Destination detail

#### Itinerary (4 screens)
- `itinerary/_layout`, `itinerary/index`, `itinerary/[id]` — Itinerary templates
- `itinerary/item/_layout`, `itinerary/item/[itemId]` — Itinerary item detail

#### Profile & Settings (16 screens)
- `profile/index` — Profile overview
- `profile/edit` — Edit profile
- `profile/friends` — Friends list + find friends
- `profile/events/index` — My events
- `profile/appearance/index` — Theme/appearance settings
- `profile/security/index` — Security hub
- `profile/security/change-password` — Change password
- `profile/security/two-factor-auth` — 2FA setup
- `profile/security/privacy-settings` — Privacy controls
- `profile/security/delete-account` — Account deletion
- `profile/support/index` — Support hub
- `profile/support/help-center` — Help/FAQ
- `profile/support/contact-support` — Contact form
- `profile/support/report-issue` — Issue reporting
- `profile/support/feedback` — Feedback form
- `profile/about/*` — Legal pages (privacy, terms, cookies, safety, our story, connect)

#### Other
- `search` — Global search with URL paste detection
- `notifications` — Notification centre
- `invite/[code]` — Trip invite deep link handler
- `trip/[tripId]` — Trip deep link handler
- `feed` — Social feed
- `ai/index` — AI features entry

### Key Features — Detailed

#### 1. Trip Planning (Core)
- **Manual creation**: Multi-step form — destination (autocomplete), dates (calendar), category, visibility, cover image
- **AI generation**: Free-text prompt → Claude generates a multi-day itinerary → materialized into Convex with Viator/LiteAPI provider matching + Unsplash image backfill
- **Collaborative**: Trip members with roles (owner/editor/viewer), join codes, invite links
- **Itinerary builder**: Day-by-day view with drag-to-reorder items, add activities/transport/food/lodging
- **Ideas/saved items**: Save flights/hotels/tours/restaurants to a trip for group discussion
- **Polls**: Create single-choice/multi-choice/ranked polls for group decisions
- **Expenses**: Track shared expenses with equal/custom splits, settle debts
- **Posts**: Trip timeline with text + images
- **Checklists**: Shared to-do lists for trip preparation

#### 2. Booking (Flights, Hotels, Experiences)
- **Flights**: Search via Duffel API → passenger entry → Stripe Payment Sheet → confirmation
- **Hotels**: Search via LiteAPI → room selection → Stripe payment → confirmation
- **Experiences**: Browse via Viator/Ticketmaster/Yelp/Tiqets → detail view → external booking link
- All bookings create `bookings` records with commission tracking

#### 3. Discovery / Explore
- **Home feed**: Featured hero carousel, upcoming trips, featured events, add-on experiences, friends activity, open polls
- **Explore tab**: Search across itineraries, events, experiences, destinations, public trips, Viator tours
- **Category filters**: All/Trips/Experiences with sub-categories and price ranges
- **Discover integration** (planned): searchByCategory action fans out to Viator, LiteAPI, Duffel, Yelp, Ticketmaster, Geoapify, Tiqets

#### 4. Events
- Browse featured/published events
- Event detail with gallery, map, participants, pricing
- RSVP (interested/going/not going)
- Ticket purchasing via Stripe (when host uses Runwae ticketing mode)

#### 5. Social
- Friends system: send/accept/block friend requests
- Friends activity feed on home screen
- Find friends (contact sharing)
- Public trips visible on Explore

#### 6. User Saves (Wishlist)
- Heart icon on Discover cards saves to `user_saves` table
- Saved tab shows grouped saves by category
- Distinct from trip-scoped `saved_items`

#### 7. Notifications
- In-app notification centre
- Push notifications (expo-notifications + Convex push token registration)
- Types: trip invite, friend request, friend accepted, poll created/closed, expense added/settled, booking confirmed, event reminder, ticket issued

#### 8. Profile & Settings
- Edit profile (name, avatar, username via image upload)
- Home location + airport for personalized recommendations
- Theme preference (light/dark/system)
- Security: change password, 2FA (UI exists, backend TBD), privacy settings, account deletion (30-day soft-delete window)
- Support: help centre, contact form, issue reporting, feedback

### App Configuration

- **Bundle IDs**: `app.runwae.io` (prod), `app.runwae.dev` (dev), `app.runwae.preview` (preview)
- **Deep linking**: `runwae://` scheme + `applinks:app.runwae.io` (iOS associated domains)
- **Android intent filters**: `/auth/callback`, `/trip/*`, `/hotel/*`, `/destination/*`, `/invite/*`
- **EAS Build**: 3 profiles (development, preview, production)
- **EAS Submit**: iOS App Store (ASC app ID: 6765879787, team: 5WJR695A8F)
- **OTA Updates**: expo-updates configured, channels per build profile
- **Error tracking**: Sentry (org: runwae, project: react-native)

---

## 4. Consumer Web App (`apps/web`)

### Overview

Next.js 15 App Router app providing the B2C consumer web experience. Mirrors mobile features with web-specific UX (modal flows, grid layouts, etc.).

### Route Structure

| Group | Routes | Auth |
|-------|--------|------|
| `(auth)` | `/sign-in`, `/sign-up` | Anonymous only |
| `(app)` | `/home`, `/trips/*`, `/events/*`, `/explore`, `/profile`, `/bookings` | Required |
| `(public)` | `/t/[slug]`, `/e/[slug]`, `/d/[slug]` | Open (shareable links) |

### Key Features
- Convex Auth (Google OAuth + Password) with `convexAuthNextjsMiddleware`
- Discover grid with 10 category chips (All, Fly, Stay, Do, Explore, Adventure, Eat/Drink, Attend, Shop, Relax)
- Trip creation with AI assistant
- Event detail with Stripe Checkout for ticket purchase
- Stripe webhooks for payment confirmation
- Public sharing pages for trips, events, destinations
- UploadThing for image uploads
- Tailwind CSS v4 with custom design tokens

---

## 5. Admin Console (`apps/admin`)

### Overview

Internal admin dashboard for the founders. Next.js 15 + shadcn/ui + TanStack Table.

### Pages
- **Overview**: Dashboard with key metrics
- **Destinations**: Full CRUD with featured ranking, soft delete, geocoding
- **Itinerary Templates**: CRUD with day/item editor, drag-to-reorder, featured/published status
- **Events**: Read + curate (trending toggle, admin notes, unpublish)
- **Collections**: CRUD for curated entity collections (events, destinations, experiences, trips)
- **Users**: List, search, admin promote/demote, suspend/unsuspend
- **Hosts**: Host applications, host detail, host leaderboard
- **Bookings**: View all platform bookings
- **Payouts**: Manage host payouts
- **Support**: View/manage issue reports
- **Settings**: Platform configuration

### Auth Gate
All routes require `isAdmin === true` on the user record. Non-admins see a "Forbidden" page.

---

## 6. Host Dashboard (`apps/hosts`)

### Overview

Vendor-facing dashboard for event hosts. Next.js 15 + shadcn/ui.

### Pages
- **Apply**: Host application form (for new vendors)
- **Overview**: Event performance metrics, charts
- **Events**: List, create, edit events (with ticketing mode selection)
- **Bookings**: View bookings for host's events
- **Earnings**: Revenue breakdown
- **Payouts**: Payout history and status
- **Attendee Insights**: Analytics on event attendees
- **Settings**: Host profile configuration

### Event Creation
- Name, description, category, location (with map picker)
- Date/time with timezone
- Cover image + gallery (UploadThing)
- Ticketing mode: Runwae (in-platform), External (link), Free, None
- Commission split configuration

---

## 7. Convex Backend (`packages/convex`)

### Schema (34+ tables)

#### Identity & Social
| Table | Purpose |
|-------|---------|
| `users` | User profiles (merged with @convex-dev/auth fields) |
| `friendships` | Friend requests and relationships |

#### Core Entities
| Table | Purpose |
|-------|---------|
| `destinations` | Curated travel destinations |
| `experiences` | Bookable experiences/activities |
| `itinerary_templates` | Admin-curated multi-day itinerary templates |
| `collections` | Curated collections of entities |

#### Trips
| Table | Purpose |
|-------|---------|
| `trips` | Trip records with destination, dates, visibility, status |
| `trip_members` | Members with roles (owner/editor/viewer) |
| `saved_items` | Trip-scoped saved items (flights, hotels, tours, etc.) |
| `user_saves` | User-level wishlist (hearts on Discover) |
| `itinerary_days` | Day entries for trip itineraries |
| `itinerary_items` | Individual items within itinerary days |
| `trip_posts` | Social posts within a trip |
| `trip_polls` | Group polls for decisions |
| `poll_options` | Options for polls |
| `poll_votes` | Votes on poll options |
| `trip_checklists` | Shared to-do lists |
| `checklist_items` | Items within checklists |
| `expenses` | Shared expense tracking |
| `expense_splits` | Per-user expense splits |
| `saved_item_comments` | Comments on saved items |

#### Events & Ticketing
| Table | Purpose |
|-------|---------|
| `events` | Event listings |
| `event_ticket_tiers` | Ticket pricing tiers |
| `event_tickets` | Issued tickets |
| `event_attendees` | RSVP tracking |
| `event_hosts` | Co-hosts for events |

#### Revenue
| Table | Purpose |
|-------|---------|
| `bookings` | All platform bookings (flights, hotels, tours, event tickets) |
| `commissions` | Platform commission tracking |
| `payouts` | Host payout records |
| `subscriptions` | Pro subscription records |

#### Platform
| Table | Purpose |
|-------|---------|
| `reviews` | User reviews for entities |
| `share_links` | Shortened share links with click tracking |
| `exchange_rates` | Currency conversion rates (refreshed daily) |
| `notifications` | In-app notifications |
| `ai_trips` | AI trip generation records |
| `issue_reports` | User-submitted issue reports |
| `discovery_cache` | Cached provider API responses (24h TTL) |

### Auth System
- `@convex-dev/auth` with Google OAuth + Password providers
- Session management via Convex Auth tables (`authSessions`, `authAccounts`, `authRefreshTokens`, `authVerificationCodes`, `authRateLimits`, `authVerifiers`)
- Admin gating via `requireAdmin()` helper
- Email verification currently disabled (no Resend verifier configured)

### External API Integrations
| Provider | Purpose | Backend File |
|----------|---------|-------------|
| Duffel | Flight search & booking | `providers/duffel.ts` |
| LiteAPI | Hotel search & booking | `providers/liteapi.ts` |
| Viator | Experience/tour search | `providers/viator.ts` |
| Ticketmaster | Event discovery | `providers/ticketmaster.ts` |
| Yelp | Restaurant discovery | `providers/yelp.ts` |
| Tiqets | Attraction tickets | `providers/tiqets.ts` |
| Geoapify | Place data | `providers/geoapify.ts` |
| Unsplash | Image backfill | Used in AI trip generation |
| Stripe | Payments, subscriptions, payouts | `bookings.ts`, webhooks |
| Anthropic Claude | AI trip generation | `ai.ts` |
| Resend | Transactional email | `lib/email.ts` |

### Cron Jobs
- `refreshRates`: Daily at 03:00 UTC — fetches exchange rates (base: GBP)

---

## 8. Legacy Systems

### Legacy Web App (`web/`)
- Original Next.js vendor/host management dashboard
- Used Clerk for auth + Supabase for data
- **Being replaced by** `apps/hosts` (Convex-based)
- Should be considered deprecated

### Legacy Express Backend (`backend/`)
- Express API server
- **Being phased out** — all new logic goes to Convex

### Supabase Migrations (`supabase/`)
- Historical migration files from the pre-Convex era
- Reference only — not active

---

## 9. Mobile Launch Readiness Checklist

### Core Functionality

- [x] **Auth**: Email/password sign-up and login working via Convex Auth
- [x] **Onboarding**: 5-step boarding flow (name, preferences, location, currency, completion)
- [x] **Home feed**: Featured content, upcoming trips, events, experiences, friends activity
- [x] **Explore**: Search + browse with category filters and sub-category pills
- [x] **Trip creation**: Manual form with destination, dates, category, cover image
- [x] **AI trip creation**: Free-text prompt generates multi-day itinerary
- [x] **Trip detail**: Tabbed view (itinerary, ideas, polls, expenses, posts)
- [x] **Trip members**: Join codes, invite links, role management
- [x] **Itinerary builder**: Day-by-day view with item management
- [x] **Polls**: Create/vote on group polls
- [x] **Expenses**: Add/split shared expenses
- [x] **Posts**: Trip timeline posts with images
- [x] **Flight search**: Duffel-powered results with booking flow
- [x] **Hotel search**: LiteAPI-powered results with room selection
- [x] **Hotel booking + payment**: Stripe Payment Sheet integration
- [x] **Flight booking + payment**: Stripe Payment Sheet integration
- [x] **Experience browsing**: Viator/Ticketmaster/Yelp results
- [x] **Event listing + detail**: Featured events with RSVP
- [x] **Destination detail**: Info, gallery, recommendations
- [x] **User saves/wishlist**: Heart icon on cards, grouped saves view
- [x] **Notifications**: In-app notification centre
- [x] **Push notifications**: Token registration + foreground handler
- [x] **Profile editing**: Name, avatar upload, username
- [x] **Friends system**: Send/accept requests, find friends
- [x] **Dark mode**: System/manual toggle with persistence
- [x] **Deep linking**: URL scheme + universal links configured
- [x] **Error boundaries**: RouteErrorBoundary exported for all routes

### Infrastructure

- [x] **EAS Build profiles**: development, preview, production configured
- [x] **EAS Submit**: iOS App Store credentials configured
- [x] **OTA Updates**: expo-updates with channel-based delivery
- [x] **Sentry**: Error tracking configured (org: runwae)
- [x] **App variants**: Separate bundle IDs for dev/preview/prod
- [x] **Stripe merchant IDs**: Per-variant merchant identifiers
- [x] **Adaptive icons**: Android foreground/background/monochrome configured
- [x] **Splash screen**: Configured with light/dark variants
- [x] **Fonts**: Bricolage Grotesque (display) + Inter (body) bundled

### Missing / Not Ready

- [ ] **No automated tests**: Zero test files exist (no unit, integration, or E2E tests)
- [ ] **No Android submit config**: `eas.json` only has iOS submit — Android Play Store submission not configured
- [ ] **Email verification disabled**: Password sign-ups skip email verification (no Resend verifier wired)
- [ ] **2FA UI exists but backend not implemented**: Two-factor auth screen is a shell
- [ ] **Social login hidden**: Google/Apple/Facebook OAuth buttons exist but are hidden
- [ ] **No App Store screenshots/metadata**: Not tracked in repo
- [ ] **No privacy policy URL in app config**: Required for App Store submission
- [ ] **No rate limiting on client**: AI trip generation has server-side quota but no client-side throttle
- [ ] **No offline support**: App requires network for all operations
- [ ] **No mobile analytics**: No product analytics on mobile (the web app has PostHog, but mobile has none)
- [ ] **No crash-free rate baseline**: Sentry configured but no alerting thresholds
- [ ] **No Terms of Service / Privacy Policy**: Pages exist as routes but content may not be finalized
- [ ] **Trip-from-link feature specced but not built**: `docs/trip-from-link-spec.md` exists but no implementation
- [ ] **Mobile Discover grid not built**: `docs/mobile-discover-plan.md` specced but not implemented (home screen lacks the full 10-category Discover experience the web has)
- [ ] **Experiences sectioned results**: `docs/experiences-chip-spec.md` specced but implementation status unclear
- [ ] **Event ticket purchase on mobile**: Planned for Phase C of ticketing spec — not implemented

### App Store Requirements

- [ ] **App Store Connect setup**: ASC app ID exists (6765879787) but full metadata unverified
- [ ] **App Review guidelines compliance**: No self-audit documented
- [ ] **Age rating**: Not configured in repo
- [ ] **Export compliance**: Not configured
- [ ] **Apple Sign-In**: Required if offering any social login — not yet implemented
- [ ] **ATT (App Tracking Transparency)**: No tracking framework so likely exempt, but should be explicitly declared
- [ ] **Location permission strings**: Configured in `app.config.ts` but only basic copy ("Allow Runwae to use your location")

---

## 10. Issues & Problems Found

### Critical Issues

#### C1. Zero Test Coverage
No test files exist anywhere in the mobile app. No `__tests__/` directory, no `.test.ts` files, no E2E test setup (Detox, Maestro, etc.). For a payment-processing app handling real money, this is a significant risk.

**Impact**: Any code change can silently break payment flows, auth, or data integrity.

#### C2. Email Verification Disabled
Comment in `_layout.tsx:186-187`:
> "Email-verification gate is intentionally disabled until the Convex auth setup adds a verifier (Resend integration). Password sign-ups land straight in the boarding flow."

Users can sign up with any email address without verification. This creates risks for:
- Fake accounts and spam
- Account recovery (no verified email to send reset links to)
- Payment disputes (unverified identity)

#### C3. Hardcoded Currency Display in Hotel Payment
`hotel/payment.tsx:206` displays price as `{currency} {price.toFixed(0)}` — raw string concatenation instead of `Intl.NumberFormat`. This violates the project convention and will display incorrectly for many currencies (e.g., "JPY 15000" instead of "¥15,000").

The flight payment screen (`flights/book/payment.tsx:100-104`) does use `Intl.NumberFormat` correctly — inconsistency between the two.

#### C4. Feature Backlog References Supabase
`apps/mobile/docs/FEATURE_BACKLOG.md` (line 14, line 41) references Supabase ("Will use a `favorites` table in Supabase", "offline-first cache, syncing with Supabase"). The platform has fully migrated to Convex — this document is stale and could mislead contributors.

#### C5. Collections Table Index Typo
`schema.ts:177`: The index name is `"by_entity_tyåpe"` (contains `å` instead of `a`). This is a live schema typo that will make the index harder to use in queries.

#### C6. No Android Play Store Submit Configuration
`eas.json` only configures iOS submission (Apple ID, ASC app ID, team ID). Android submission credentials are completely missing.

#### C7. Live Stripe Key and Sentry Auth Token Committed to `.env`
The `apps/mobile/.env` file is checked into git containing a **live Stripe publishable key** (`pk_live_...`) and a **Sentry auth token**. While the Stripe key is read-only (publishable), the Sentry auth token should be in CI secrets only. This is a secrets management violation.

#### C8. Commission Calculation Bug
In `packages/convex/convex/commissions.ts`, the `splitPct` value is multiplied raw instead of being divided by 100. For example, if `splitPct` is `5` (meaning 5%), the code multiplies by `5` instead of `0.05`, producing commission amounts 100x too large. This would cause incorrect financial records for any real bookings.

### High Priority Issues

#### H1. Refresh Handler is a No-Op
`(tabs)/index.tsx:72-77`: The pull-to-refresh handler just does `setTimeout(() => setRefreshing(false), 1500)` — it doesn't actually re-fetch any data. Users pull to refresh and nothing happens except a fake spinner.

#### H2. console.log Statements in Production Code
15+ files in `apps/mobile/app/` contain `console.log`, `console.warn`, or `console.error` statements. These should be removed or replaced with Sentry breadcrumbs for production:
- `hotel/payment.tsx` (3 occurrences)
- `flights/book/payment.tsx` (2 occurrences)
- `create-trip/index.tsx` (2 occurrences)
- `hotel/confirmation.tsx` (2 occurrences)
- And more across the codebase

#### H3. Filter Modal "Apply" Does Nothing Meaningful
`(tabs)/explore.tsx:68-71`: The `handleApplyFilters` function just logs to console and closes the modal. The filters are already applied via `useMemo` — the "Apply" button is redundant but gives users a false sense of action.

#### H4. Member Management Mutations are Stubbed
`removeMember` and `updateMemberRole` in `TripsContext` return hardcoded error strings (`"Member removal isn't wired up yet"`, `"Role updates aren't wired up yet"`). The UI for managing trip members exists but the underlying mutations do nothing. Users who tap "Remove member" or try to change a member's role will see an error.

#### H5. Stub Data in Itinerary Travel Times
`TripItineraryTab.tsx:250`: Travel time calculations between itinerary items use hardcoded stub data (`distanceKm = 2 + i*1.5, durationMin = 10 + i*5`). This is documented in `CLAUDE.md` but will give users misleading travel time estimates.

#### H6. Missing Error Handling in Payment Flows
`hotel/payment.tsx:150-155`: The catch block in `handlePay` only logs to console — no user-facing error message is shown:
```
catch (err) {
  console.error('[PaymentFlow] Error:', err);
  // Main error handler for everything else
}
```
Similarly in `flights/book/payment.tsx:93-94`.

#### H7. Saved Screen Uses ActivityIndicator (Spinner)
`(tabs)/saved.tsx:73`: Uses `<ActivityIndicator>` for loading state. The project convention (per CLAUDE.md) is "Never add loading spinners — use Suspense + skeleton components."

#### H8. Dark Mode CSS Class Typo
`(tabs)/saved.tsx:106-107`: References `dark:bg-dark-seconndary/50` and `dark:border-dark-seconndary` — "seconndary" is misspelled with double-n. This likely means the dark mode background doesn't apply correctly on the saved items cards.

### Medium Priority Issues

#### M1. Duplicate Hotel Routes
Two separate route structures for hotels:
- `hotel/[hotelId]` (under `app/hotel/`)
- `hotels/[hotelId]/index` (under `app/hotels/`)

This creates confusion about which route to navigate to and may cause inconsistent UX.

#### M2. RecommendationsSection TODO
`components/destination/RecommendationsSection.tsx:100`:
```
// TODO: Implement this, the bug is on [productCode] route
```
This suggests Viator product navigation from destination recommendations is broken.

#### M3. Explore Filter Console Log
`(tabs)/explore.tsx:69`: `console.log('Applying filters:', ...)` left in production code.

#### M4. No Pagination on Several List Views
The Explore screen, Saved screen, and several other list views load all data at once. For users with many saved items or when exploring large datasets, this will cause performance issues.

#### M5. Inconsistent Styling Approach
The app mixes three styling approaches:
1. NativeWind/Tailwind classes (`className="..."`)
2. React Native `StyleSheet.create()` (in payment screens, etc.)
3. Inline styles (`style={{ ... }}`)

While functional, this inconsistency makes the codebase harder to maintain.

#### M6. Missing Accessibility
No evidence of accessibility testing or implementation:
- No `accessibilityLabel` props on interactive elements
- No `accessibilityRole` annotations
- No screen reader testing documented
- Tab bar icons lack accessibility labels

#### M7. No Image Caching Strategy
While `expo-image` handles caching automatically, there's no explicit cache eviction policy or size limit. The app fetches many images (hotel photos, destination galleries, Viator tours) which could consume significant storage on device.

#### M8. Fallback Unsplash Image Hardcoded
`(tabs)/saved.tsx:111`: Fallback image URL `https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400` is hardcoded. If this image is removed from Unsplash, saved items without images will show broken images.

#### M9. Missing Guest Count Validation in Hotel Booking
`hotel/payment.tsx:72`: `const guests = parseInt(guestsStr ?? '1', 10)` — the guest count is parsed but never validated or displayed. If the parameter is missing or invalid, it silently defaults to 1.

#### M10. No Loading States for Mutation Actions
Several mutation calls (expense creation, poll voting, post submission) don't show loading indicators or disable buttons during submission, risking double-taps and duplicate entries.

#### M11. Web App Public Pages are Placeholders
`/t/[slug]` (public trip page) and `/d/[slug]` (public destination page) render bare `<h1>` tags with just the slug text — no real content. Only `/e/[slug]` (public event page) is functional. These are the shareable URLs that would be sent to non-logged-in users.

#### M12. Web App Home Hero is Hardcoded
`HomePageClient.tsx` renders a hardcoded "Lisbon in Spring" hero with a picsum.photos placeholder image. The right-rail "activities planned" stat is hardcoded to "9". The Discover grid has 4 hardcoded stub cards with picsum.photos images.

#### M13. Reviews and Share Links Schema Tables Have No Public CRUD
The `reviews` and `share_links` tables exist in the schema but have no public-facing query or mutation functions. The UI references reviews in experience detail screens but they can never be written or read.

#### M14. Search Uses Naive Full-Table Scans
`packages/convex/convex/search.ts` performs substring matching via full-table scans on every search. There are no Convex search indexes configured. This will degrade significantly as data grows.

### Low Priority / Cosmetic Issues

#### L1. Search Screen Placeholder Text
Multiple search forms use generic placeholder text that could be more helpful.

#### L2. Missing Haptic Feedback
`haptic-tab.tsx` exists in components but haptic feedback is only used in the tab bar — key interactions like saves, bookmarks, and confirmations lack tactile feedback.

#### L3. No Skeleton for All Sections
While `ExploreSkeleton` and `CardSkeletons` exist, not all loading states use consistent skeleton components.

#### L4. Saved Tab Not in Tab Bar (iOS 18+ Native Tabs)
The native tabs configuration only shows Home, Explore, Trips, Profile, and Create. The "Saved" tab is in the old-style tab bar but missing from the iOS 18+ liquid glass native tabs.

#### L5. Version Mismatch Risk
`package.json` version is `0.8.6` — this is a pre-1.0 version which is appropriate for beta but should be considered when setting user expectations.

### Planned Features Not Yet Implemented

Per the docs and specs in `docs/`:
1. **Trip from YouTube/TikTok link** (`trip-from-link-spec.md`) — fully specced, not built
2. **Mobile Discover grid** (`mobile-discover-plan.md`) — 4-phase plan, not started
3. **Sectioned experience results** (`experiences-chip-spec.md`) — specced, implementation in progress
4. **Runwae ticketing Phase C** (`runwae-ticketing-spec.md`) — self-serve refunds, multi-tier, QR check-in, mobile purchase
5. **Mobile event ticket purchase** — deferred to Phase C
6. **Apple Sign-In** — required for App Store if offering social auth
7. **Product analytics** — no analytics framework integrated
8. **Offline support** — fully online-only currently
9. **Internationalization** — English only, no i18n framework
10. **Favourites/heart on all cards** — heart icon hidden per `FEATURE_BACKLOG.md`

---

*This document should be updated as features ship and issues are resolved.*
