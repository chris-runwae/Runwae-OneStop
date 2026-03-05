# Runwae
Version: 1.0  

---

# 1. Overview

Runwae consists of:

1. Web App & Mobile App (User-Facing)
   - Browse events
   - Plan trips
   - Invite users
   - Manage group budgets
   - Book travel
   - View vendor listings

2. Event Vendor Dashboard
   - Vendor onboarding
   - Service listing management
   - Booking management
   - Availability control
   - Payout tracking
   - Analytics

---

# 2. High-Level Architecture

## 2.1 System Overview

Client (Web App / Vendor Dashboard)
        ↓
Next.js App (SSR + API Routes where needed)
        ↓
Supabase or Express (Auth + Postgres + RLS + Storage)
        ↓
External APIs (Travel APIs, Stripe)

---

# 3. Tech Stack

## 3.1 Web App

- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- State: React Query / TanStack Query
- Auth: Supabase Auth
- Payments: Stripe Checkout
- Hosting: Vercel
- Analytics: PostHog

## 3.2 Vendor Dashboard

- Framework: Next.js (same monorepo preferred)
- Role-based access control via Supabase RLS
- Separate dashboard route: `/vendor/*`

---

# 4. Authentication & Authorization

## 4.1 Auth Provider
Supabase Auth (Email + OAuth optional)

## 4.2 Roles

Stored in `profiles` table:

- user
- vendor
- admin

## 4.3 RLS Strategy

- Users can access only their trips, bookings, expenses.
- Vendors can access only:
  - Their vendor profile
  - Their service listings
  - Bookings assigned to them

Policies enforced at database level.

---

# 5. Database Schema (Core Tables)

## 5.1 Users & Profiles

### profiles
- id (uuid, PK, references auth.users)
- role (enum: user, vendor, admin)
- full_name
- created_at (timestamptz)

---

## 5.2 Trips

### trips
- id (uuid, PK)
- name
- created_by (uuid, FK → profiles.id)
- start_date
- end_date
- created_at (timestamptz)

### trip_members
- id (uuid)
- trip_id (uuid FK)
- user_id (uuid FK)
- role (owner, member)

---

## 5.3 Expenses

### expenses
- id (uuid)
- trip_id (uuid FK)
- paid_by (uuid FK)
- amount (numeric)
- currency (varchar)
- description
- created_at (timestamptz)

### expense_splits
- id (uuid)
- expense_id (uuid FK)
- user_id (uuid FK)
- amount (numeric)

---

## 5.4 Events & Vendors

### vendors
- id (uuid)
- owner_id (uuid FK → profiles.id)
- business_name
- description
- status (pending, approved, suspended)
- created_at (timestamptz)

### services
- id (uuid)
- vendor_id (uuid FK)
- title
- category
- base_price
- currency
- availability_config (jsonb)
- created_at (timestamptz)

### bookings
- id (uuid)
- user_id (uuid FK)
- service_id (uuid FK)
- trip_id (uuid nullable)
- status (pending, confirmed, cancelled)
- total_amount
- stripe_session_id
- created_at (timestamptz)

---

# 6. Web App Architecture

## 6.1 Routes

### Public
- `/`
- `/events`
- `/vendors/[id]`

### Authenticated
- `/dashboard`
- `/trips`
- `/trips/[id]`
- `/expenses`
- `/bookings`

## 6.2 Data Fetching

- Use React Query for client state
- Use Server Components for initial SSR where SEO matters
- All mutations go directly to Supabase or via Edge Functions

---

# 7. Vendor Dashboard Architecture

## 7.1 Routes

- `/vendor`
- `/vendor/listings`
- `/vendor/listings/[id]`
- `/vendor/bookings`
- `/vendor/payouts`
- `/vendor/settings`

## 7.2 Vendor Capabilities

- Create/update services
- Manage availability
- View booking list
- Update booking status
- View payout history

All queries filtered via RLS.

---

# 8. Payments Architecture

## 8.1 Flow

1. User selects service
2. Stripe Checkout session created (via Edge Function)
3. User redirected to Stripe
4. Webhook confirms payment
5. Booking status updated to "confirmed"

## 8.2 Webhooks

Stripe → Supabase Edge Function:
- checkout.session.completed
- payment_intent.payment_failed
- charge.refunded

---

# 9. External Travel API Integration

Travel API (LiteAPI) calls:
- Search and list hotels
- Create bookings
- Fetch booking status

Viator API calls:
- Search and list tours
- Redirect for booking
- Fetch booking status

All sensitive API calls proxied via:
Supabase Edge Functions

Never expose API keys to frontend.

---

# 10. Security

- UUID primary keys
- RLS enforced on all tables
- Never trust frontend role
- All role logic enforced in database policies
- Stripe handles PCI compliance

---

# 11. Observability

- Logging via Supabase logs
- Error tracking via Sentry
- Analytics via PostHog

---

# 12. Deployment Strategy

- Dev branch → Preview environment
- Main branch → Production
- Separate projects for staging & prod

---

# 13. Future Considerations

- Escrow-style payouts
- Vendor dispute system
- Admin moderation dashboard
- AI itinerary recommendations
- Multi-currency support
