# Runwae OneStop — Engineering Context

## Repo Structure

| Path | Purpose |
|------|---------|
| `apps/web/` | Next.js 15 App Router — B2C consumer web (trips, events, explore) |
| `packages/convex/` | Convex backend — schema, auth, queries, mutations |
| `packages/ui/` | Shared design tokens (components TBD) |
| `mobile/` | Expo React Native — existing B2C mobile app |
| `web/` | Legacy Next.js — vendor / host-management dashboard |
| `backend/` | Legacy Express API (being phased out) |
| `supabase/` | Legacy Supabase migrations (reference only) |

Branch `feat/convex-migration`: migrating `web/` from Clerk + Supabase → Convex + @convex-dev/auth.
The new `apps/web` IS the migrated B2C app.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Web framework | Next.js 15 (App Router) |
| Backend / DB | Convex |
| Auth | @convex-dev/auth — Google OAuth + Password |
| Styling | Tailwind CSS v4 (no tailwind.config.ts) |
| Fonts | Bricolage Grotesque (display) · Inter (body) |
| Payments | Stripe (webhooks at `/api/webhooks/stripe`) |
| File uploads | UploadThing |
| Email | Resend |
| Package manager | pnpm (workspaces) |
| Monorepo | Turborepo |
| Mobile | Expo (separate workspace, not in Turborepo) |

## Key Conventions

- All timestamps in **epoch milliseconds** — Convex stores as `v.number()`
- Slugs = `kebab-title-<nanoid>` for uniqueness
- Currency default: `GBP`; user pref stored in `users.currency`
- Tailwind v4: all tokens in `apps/web/app/globals.css` under `@theme {}`
- Components always import `cn()` from `@/lib/utils`
- `formatCurrency`, `formatDate`, `formatRelativeTime` all live in `@/lib/utils`

## Design Tokens

- **Primary**: `hsla(327, 99%, 42%, 1)` — Runwae pink/magenta
- **Display font**: Bricolage Grotesque (weights 200–800)
- **Body font**: Inter

Source of truth: `packages/ui/tokens.ts` → mirrored in `apps/web/app/globals.css`.

## Auth Flow

- `middleware.ts` uses `convexAuthNextjsMiddleware`
- **Public routes**: `/sign-in`, `/sign-up`, `/t/*`, `/e/*`, `/d/*`
- **Protected routes**: everything else (`(app)/*`)
- Server: `ConvexAuthNextjsServerProvider` in root `layout.tsx`
- Client: `ConvexAuthNextjsProvider` in `components/providers.tsx`

## Route Groups

| Group | Path | Auth |
|-------|------|------|
| `(auth)` | `/sign-in`, `/sign-up` | Anonymous only |
| `(app)` | `/home`, `/trips/*`, `/events/*`, `/explore`, `/profile` | Required |
| `(public)` | `/t/[slug]`, `/e/[slug]`, `/d/[slug]` | Open |

## Convex Backend (`packages/convex/convex/`)

| File | Domain |
|------|--------|
| `schema.ts` | Full schema definition (19 tables + authTables) |
| `auth.ts` | convexAuth() — Google + Password |
| `auth.config.ts` | JWT provider config |
| `http.ts` | OAuth callback HTTP routes |
| `users.ts` | Profile CRUD |
| `trips.ts` | Trip + membership + join codes |
| `events.ts` | Event listing + registration |
| `destinations.ts` | Destination content |
| `itinerary.ts` | Day-by-day itinerary |
| `bookings.ts` | Stripe-linked bookings |
| `commissions.ts` | Platform fee tracking |
| `saved_items.ts` | User saves / wishlist |
| `social.ts` | Reviews, follows |
| `notifications.ts` | In-app notifications |
| `currency.ts` | Currency conversion |
| `search.ts` | Cross-entity search |
| `ai.ts` | AI trip planning (Convex Actions) |

## Schema Gotcha: users table

`@convex-dev/auth` manages the `users` table — its fields (`name`, `email`, `image`, `emailVerificationTime`, `phone`, `phoneVerificationTime`, `isAnonymous`) and its `email`/`phone` indexes are **required at runtime**.

Because `authTables.users.extend()` is not available in the current `convex` version, `schema.ts` inlines those auth fields alongside the custom ones (`username`, `bio`, `currency`, `timezone`, `createdAt`, `updatedAt`). All custom fields are `v.optional()` because auth inserts the row before the app can populate them.

If you upgrade `@convex-dev/auth`, re-verify the auth fields still match.

## Running Locally

```bash
# Install all workspace dependencies
pnpm install

# Terminal 1 — Convex backend
cd packages/convex && pnpm dev

# Terminal 2 — Next.js web app
cd apps/web && pnpm dev
```

Environment variables needed in `apps/web/.env.local`:
```
NEXT_PUBLIC_CONVEX_URL=https://<your-project>.convex.cloud
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Environment variables needed on the Convex dashboard:
```
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```
## Claude Code Conventions

- All Convex queries: `useQuery(api.[table].[function], args)`
- All Convex mutations: `useMutation(api.[table].[function])`
- Auth: Convex Auth only. Access user via `useConvexAuth()` + viewer query
- Currency: stored in item's native currency, displayed in `users.currency`
- Dates: stored as UTC epoch ms, displayed via `Intl.DateTimeFormat` with timezone
- Images: UploadThing for uploads, picsum for dev placeholders
- Components: `apps/web/components/[domain]/`
- Pages: `apps/web/app/(app)/[route]/page.tsx`

## Do Not

- Never use Clerk — auth is Convex Auth (`@convex-dev/auth`)
- Never use Supabase — fully migrated away
- Never add loading spinners — use Suspense + skeleton components
- Never hardcode currency symbols — use `Intl.NumberFormat`
- Never hardcode timezone — always use the entity's `.timezone` field
- Never import from `web/` (legacy vendor app) — use `apps/web/`