# Runwae B2C Web App — Turborepo Setup Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Runwae B2C consumer web app as a Turborepo + pnpm monorepo alongside the existing standalone directories, with a Next.js 15 App Router in `apps/web`, a Convex backend package in `packages/convex`, and an empty shared UI library in `packages/ui`.

**Architecture:** Turborepo at repo root manages `apps/*` and `packages/*`; the existing `web/` (vendor dashboard), `mobile/`, and `backend/` directories remain standalone and untouched. `packages/convex` owns all Convex schema and functions; `apps/web` imports them as a workspace dep and connects at runtime via `NEXT_PUBLIC_CONVEX_URL`. Auth uses `@convex-dev/auth` with Google OAuth + Password on both the Convex side and the Next.js middleware.

**Tech Stack:** Next.js 15, React 19, Convex + @convex-dev/auth, Tailwind CSS v4, Inter + Bricolage Grotesque, Stripe, UploadThing, Resend, pnpm workspaces, Turborepo

---

## Complete File Map

```
/                                              ← repo root
├── turbo.json
├── pnpm-workspace.yaml
├── package.json                               ← workspace root (no deps, scripts only)
├── CLAUDE.md
├── apps/
│   └── web/
│       ├── package.json
│       ├── next.config.ts
│       ├── tsconfig.json
│       ├── postcss.config.mjs
│       ├── vitest.config.ts
│       ├── middleware.ts
│       ├── app/
│       │   ├── globals.css                    ← Tailwind v4 @theme + dark mode
│       │   ├── layout.tsx                     ← ConvexAuthNextjsServerProvider + fonts
│       │   ├── page.tsx                       ← redirect: authed→/home, anon→/sign-in
│       │   ├── (auth)/
│       │   │   ├── layout.tsx
│       │   │   ├── sign-in/page.tsx
│       │   │   └── sign-up/page.tsx
│       │   ├── (app)/
│       │   │   ├── layout.tsx                 ← nav + providers
│       │   │   ├── home/page.tsx
│       │   │   ├── trips/page.tsx
│       │   │   ├── trips/new/page.tsx
│       │   │   ├── trips/[slug]/page.tsx
│       │   │   ├── events/page.tsx
│       │   │   ├── events/[slug]/page.tsx
│       │   │   ├── explore/page.tsx
│       │   │   └── profile/page.tsx
│       │   ├── (public)/
│       │   │   ├── t/[slug]/page.tsx          ← shared trip
│       │   │   ├── e/[slug]/page.tsx          ← shared event
│       │   │   └── d/[slug]/page.tsx          ← destination
│       │   └── api/
│       │       ├── webhooks/stripe/route.ts
│       │       └── og/trip/[slug]/route.tsx
│       ├── components/
│       │   ├── providers.tsx                  ← ConvexAuthNextjsProvider (client)
│       │   └── ui/
│       │       ├── button.tsx
│       │       ├── badge.tsx
│       │       ├── avatar.tsx
│       │       ├── avatar-stack.tsx
│       │       ├── chip.tsx
│       │       ├── chip-row.tsx
│       │       ├── card.tsx
│       │       ├── sheet.tsx
│       │       ├── tab-bar.tsx
│       │       └── date-strip.tsx
│       └── lib/
│           ├── utils.ts
│           └── utils.test.ts
└── packages/
    ├── ui/
    │   ├── package.json
    │   └── tokens.ts
    └── convex/
        ├── package.json
        └── convex/                            ← Convex functions directory
            ├── schema.ts
            ├── auth.ts
            ├── auth.config.ts
            ├── http.ts
            ├── users.ts
            ├── trips.ts
            ├── events.ts
            ├── destinations.ts
            ├── saved_items.ts
            ├── itinerary.ts
            ├── social.ts
            ├── bookings.ts
            ├── commissions.ts
            ├── currency.ts
            ├── ai.ts
            ├── notifications.ts
            └── search.ts
```

---

## Task 1: Monorepo Root

**Files:**
- Create: `turbo.json`
- Create: `pnpm-workspace.yaml`
- Create: `package.json` (workspace root)

- [ ] **Step 1: Create `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

- [ ] **Step 2: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 3: Create root `package.json`**

```json
{
  "name": "runwae",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "turbo test"
  },
  "devDependencies": {
    "turbo": "^2.5.3"
  },
  "engines": {
    "node": ">=20",
    "pnpm": ">=9"
  },
  "packageManager": "pnpm@9.15.9"
}
```

- [ ] **Step 4: Commit**

```bash
git add turbo.json pnpm-workspace.yaml package.json
git commit -m "chore: add turborepo + pnpm workspace root"
```

---

## Task 2: packages/ui

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tokens.ts`

- [ ] **Step 1: Create `packages/ui/package.json`**

```json
{
  "name": "@runwae/ui",
  "version": "0.0.1",
  "private": true,
  "main": "./tokens.ts",
  "exports": {
    ".": "./tokens.ts",
    "./tokens": "./tokens.ts"
  }
}
```

- [ ] **Step 2: Create `packages/ui/tokens.ts`**

Tokens derived from the existing `web/app/globals.css` CSS variable definitions.

```typescript
export const tokens = {
  colors: {
    primary: "hsla(327, 99%, 42%, 1)",
    primaryForeground: "hsl(0, 0%, 98.5%)",
    background: "hsl(0, 0%, 96%)",
    foreground: "hsl(0, 0%, 14.5%)",
    card: "hsl(0, 0%, 100%)",
    cardForeground: "hsl(0, 0%, 14.5%)",
    muted: "hsl(0, 0%, 97%)",
    mutedForeground: "hsla(208, 7%, 46%, 1)",
    border: "hsl(0, 0%, 92.2%)",
    input: "hsl(0, 0%, 92.2%)",
    ring: "hsl(0, 0%, 70.8%)",
    destructive: "hsl(0, 72%, 58%)",
    success: "hsl(142, 76%, 36%)",
    error: "hsl(0, 84%, 50%)",
    errorLight: "hsl(0, 84%, 97%)",
    dark: {
      background: "hsl(0, 0%, 14.5%)",
      foreground: "hsl(0, 0%, 98.5%)",
      card: "hsl(0, 0%, 20.5%)",
      muted: "hsl(0, 0%, 26.9%)",
      border: "hsl(0, 0%, 100% / 10%)",
      input: "hsl(0, 0%, 100% / 15%)",
    },
  },
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.625rem",
    xl: "0.75rem",
    "2xl": "0.875rem",
    "3xl": "1rem",
    "4xl": "1.125rem",
  },
  fonts: {
    display: "var(--font-bricolage)",
    body: "var(--font-inter)",
  },
} as const;

export type Tokens = typeof tokens;
```

- [ ] **Step 3: Commit**

```bash
git add packages/ui/
git commit -m "feat: add packages/ui with Runwae design tokens"
```

---

## Task 3: packages/convex Setup

**Files:**
- Create: `packages/convex/package.json`

- [ ] **Step 1: Create `packages/convex/package.json`**

```json
{
  "name": "@runwae/convex",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "convex dev",
    "deploy": "convex deploy"
  },
  "dependencies": {
    "@auth/core": "^0.37.4",
    "@convex-dev/auth": "^0.0.87",
    "convex": "^1.23.0"
  }
}
```

- [ ] **Step 2: Create `packages/convex/convex/` directory**

```bash
mkdir -p packages/convex/convex
```

---

## Task 4: packages/convex Schema

**Files:**
- Create: `packages/convex/convex/schema.ts`

- [ ] **Step 1: Write `packages/convex/convex/schema.ts`**

Full schema translating from the Supabase migrations (trips_section, content_tables, event_hosts_and_sub_events, event_registrations, hotel_bookings, itinerary_schema).

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    email: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    currency: v.string(),
    timezone: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_username", ["username"])
    .index("by_email", ["email"]),

  trips: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    createdBy: v.id("users"),
    budget: v.optional(v.number()),
    currency: v.string(),
    notes: v.optional(v.string()),
    visibility: v.union(
      v.literal("private"),
      v.literal("invite_only"),
      v.literal("public")
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    destinationIds: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_creator", ["createdBy"]),

  trip_members: defineTable({
    tripId: v.id("trips"),
    userId: v.id("users"),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member")
    ),
    joinedAt: v.number(),
  })
    .index("by_trip", ["tripId"])
    .index("by_user", ["userId"])
    .index("by_trip_user", ["tripId", "userId"]),

  events: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    gallery: v.array(v.string()),
    startAt: v.optional(v.number()),
    endAt: v.optional(v.number()),
    location: v.optional(v.string()),
    destinationId: v.optional(v.id("destinations")),
    price: v.optional(v.number()),
    currency: v.string(),
    capacity: v.optional(v.number()),
    registrationCount: v.number(),
    featured: v.boolean(),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("cancelled")
    ),
    joinCode: v.optional(v.string()),
    createdBy: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_destination", ["destinationId"])
    .index("by_featured", ["featured"])
    .index("by_join_code", ["joinCode"]),

  event_hosts: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    email: v.string(),
    showOnPage: v.boolean(),
    isManager: v.boolean(),
    createdAt: v.number(),
  }).index("by_event", ["eventId"]),

  event_sub_events: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    startsAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_event", ["eventId"]),

  event_registrations: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled")
    ),
    registeredAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_event_user", ["eventId", "userId"]),

  destinations: defineTable({
    title: v.string(),
    slug: v.string(),
    location: v.string(),
    imageUrl: v.optional(v.string()),
    gallery: v.array(v.string()),
    rating: v.optional(v.number()),
    reviewCount: v.number(),
    description: v.optional(v.string()),
    featured: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_featured", ["featured"]),

  experiences: defineTable({
    title: v.string(),
    slug: v.string(),
    category: v.optional(v.string()),
    rating: v.optional(v.number()),
    reviewCount: v.number(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    gallery: v.array(v.string()),
    price: v.optional(v.number()),
    currency: v.string(),
    featured: v.boolean(),
    included: v.array(v.string()),
    whatToKnow: v.array(v.string()),
    itinerarySteps: v.array(
      v.object({ time: v.string(), description: v.string() })
    ),
    destinationId: v.optional(v.id("destinations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_destination", ["destinationId"])
    .index("by_featured", ["featured"])
    .index("by_slug", ["slug"]),

  reviews: defineTable({
    entityType: v.union(
      v.literal("experience"),
      v.literal("destination"),
      v.literal("event")
    ),
    entityId: v.string(),
    userId: v.optional(v.id("users")),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    rating: v.number(),
    comment: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_entity", ["entityType", "entityId"]),

  itineraries: defineTable({
    tripId: v.id("trips"),
    title: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_trip", ["tripId"]),

  itinerary_days: defineTable({
    itineraryId: v.id("itineraries"),
    date: v.number(),
    dayNumber: v.number(),
    createdAt: v.number(),
  }).index("by_itinerary", ["itineraryId"]),

  itinerary_items: defineTable({
    itineraryDayId: v.id("itinerary_days"),
    title: v.string(),
    type: v.union(
      v.literal("activity"),
      v.literal("restaurant"),
      v.literal("hotel"),
      v.literal("transport"),
      v.literal("other")
    ),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    experienceId: v.optional(v.id("experiences")),
    cost: v.optional(v.number()),
    currency: v.optional(v.string()),
    order: v.number(),
    createdAt: v.number(),
  }).index("by_day", ["itineraryDayId"]),

  saved_items: defineTable({
    userId: v.id("users"),
    entityType: v.union(
      v.literal("trip"),
      v.literal("event"),
      v.literal("destination"),
      v.literal("experience")
    ),
    entityId: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_entity", ["userId", "entityType", "entityId"]),

  bookings: defineTable({
    userId: v.id("users"),
    experienceId: v.optional(v.id("experiences")),
    tripId: v.optional(v.id("trips")),
    eventId: v.optional(v.id("events")),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    amount: v.number(),
    currency: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    stripeSessionId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_stripe_session", ["stripeSessionId"]),

  commissions: defineTable({
    bookingId: v.id("bookings"),
    amount: v.number(),
    currency: v.string(),
    rate: v.number(),
    status: v.union(v.literal("pending"), v.literal("paid")),
    paidAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_booking", ["bookingId"]),

  expenses: defineTable({
    tripId: v.id("trips"),
    paidBy: v.id("users"),
    title: v.string(),
    amount: v.number(),
    currency: v.string(),
    category: v.optional(v.string()),
    splitMethod: v.union(v.literal("equal"), v.literal("custom")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_trip", ["tripId"]),

  expense_splits: defineTable({
    expenseId: v.id("expenses"),
    userId: v.id("users"),
    amount: v.number(),
    isSettled: v.boolean(),
    settledAt: v.optional(v.number()),
  })
    .index("by_expense", ["expenseId"])
    .index("by_user", ["userId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    read: v.boolean(),
    data: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "read"]),
});
```

- [ ] **Step 2: Commit**

```bash
git add packages/convex/
git commit -m "feat: add packages/convex with full Runwae schema"
```

---

## Task 5: packages/convex Auth Files

**Files:**
- Create: `packages/convex/convex/auth.ts`
- Create: `packages/convex/convex/auth.config.ts`
- Create: `packages/convex/convex/http.ts`

- [ ] **Step 1: Create `packages/convex/convex/auth.ts`**

```typescript
import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google, Password],
});
```

- [ ] **Step 2: Create `packages/convex/convex/auth.config.ts`**

This file is read by the Convex deployment to validate JWT tokens issued from `CONVEX_SITE_URL`.

```typescript
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
```

- [ ] **Step 3: Create `packages/convex/convex/http.ts`**

Required — registers the Convex Auth OAuth callback HTTP endpoints.

```typescript
import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();
auth.addHttpRoutes(http);
export default http;
```

- [ ] **Step 4: Commit**

```bash
git add packages/convex/convex/auth.ts packages/convex/convex/auth.config.ts packages/convex/convex/http.ts
git commit -m "feat: add Convex Auth setup with Google + Password providers"
```

---

## Task 6: packages/convex Domain Stub Files

**Files:** Create all 13 empty domain stubs in `packages/convex/convex/`.

- [ ] **Step 1: Create stub files**

Each file exports nothing yet but establishes the module boundary. Create all 13:

`packages/convex/convex/users.ts`:
```typescript
// User profile queries and mutations
```

`packages/convex/convex/trips.ts`:
```typescript
// Trip CRUD, membership management, join codes
```

`packages/convex/convex/events.ts`:
```typescript
// Event listing, registration, sub-events
```

`packages/convex/convex/destinations.ts`:
```typescript
// Destination content queries
```

`packages/convex/convex/saved_items.ts`:
```typescript
// User saves / wishlist
```

`packages/convex/convex/itinerary.ts`:
```typescript
// Itinerary days and items
```

`packages/convex/convex/social.ts`:
```typescript
// Reviews, follows, activity feed
```

`packages/convex/convex/bookings.ts`:
```typescript
// Stripe-linked bookings
```

`packages/convex/convex/commissions.ts`:
```typescript
// Platform fee tracking
```

`packages/convex/convex/currency.ts`:
```typescript
// Currency conversion helpers
```

`packages/convex/convex/ai.ts`:
```typescript
// AI-assisted trip planning (Convex Actions)
```

`packages/convex/convex/notifications.ts`:
```typescript
// In-app notifications
```

`packages/convex/convex/search.ts`:
```typescript
// Cross-entity search
```

- [ ] **Step 2: Commit**

```bash
git add packages/convex/convex/
git commit -m "feat: add Convex domain stub files"
```

---

## Task 7: apps/web Config Files

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/postcss.config.mjs`
- Create: `apps/web/vitest.config.ts`

- [ ] **Step 1: Create `apps/web/package.json`**

```json
{
  "name": "@runwae/web",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@convex-dev/auth": "^0.0.87",
    "@internationalized/date": "^3.7.0",
    "@runwae/convex": "workspace:*",
    "@runwae/ui": "workspace:*",
    "@stripe/stripe-js": "^7.4.0",
    "@uploadthing/react": "^7.7.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "convex": "^1.23.0",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.574.0",
    "next": "^15.3.2",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "resend": "^4.5.2",
    "stripe": "^17.7.0",
    "tailwind-merge": "^3.4.1",
    "uploadthing": "^7.7.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "^15.3.2",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^3.2.0"
  }
}
```

- [ ] **Step 2: Create `apps/web/tsconfig.json`**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `apps/web/next.config.ts`**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
```

- [ ] **Step 4: Create `apps/web/postcss.config.mjs`**

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

- [ ] **Step 5: Create `apps/web/vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/package.json apps/web/tsconfig.json apps/web/next.config.ts apps/web/postcss.config.mjs apps/web/vitest.config.ts
git commit -m "feat: scaffold apps/web config files"
```

---

## Task 8: apps/web Globals CSS

**Files:**
- Create: `apps/web/app/globals.css`

- [ ] **Step 1: Create `apps/web/app/globals.css`**

Tailwind v4 uses `@theme` instead of `tailwind.config.ts`. All design tokens from `packages/ui/tokens.ts` are mirrored here as CSS custom properties.

```css
@import "tailwindcss";

@theme {
  /* Fonts */
  --font-sans: var(--font-inter);
  --font-display: var(--font-bricolage);

  /* Brand */
  --color-primary: hsla(327, 99%, 42%, 1);
  --color-primary-foreground: hsl(0, 0%, 98.5%);

  /* Semantic */
  --color-background: hsl(0, 0%, 96%);
  --color-foreground: hsl(0, 0%, 14.5%);
  --color-card: hsl(0, 0%, 100%);
  --color-card-foreground: hsl(0, 0%, 14.5%);
  --color-muted: hsl(0, 0%, 97%);
  --color-muted-foreground: hsla(208, 7%, 46%, 1);
  --color-border: hsl(0, 0%, 92.2%);
  --color-input: hsl(0, 0%, 92.2%);
  --color-ring: hsl(0, 0%, 70.8%);
  --color-destructive: hsl(0, 72%, 58%);
  --color-success: hsl(142, 76%, 36%);
  --color-error: hsl(0, 84%, 50%);
  --color-error-light: hsl(0, 84%, 97%);

  /* Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.625rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 0.875rem;
  --radius-3xl: 1rem;
  --radius-4xl: 1.125rem;
}

.dark {
  --color-background: hsl(0, 0%, 14.5%);
  --color-foreground: hsl(0, 0%, 98.5%);
  --color-card: hsl(0, 0%, 20.5%);
  --color-card-foreground: hsl(0, 0%, 98.5%);
  --color-muted: hsl(0, 0%, 26.9%);
  --color-muted-foreground: hsla(208, 7%, 46%, 1);
  --color-border: hsl(0, 0%, 100% / 10%);
  --color-input: hsl(0, 0%, 100% / 15%);
  --color-ring: hsl(0, 0%, 55.6%);
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground font-sans;
  }
  button {
    @apply cursor-pointer disabled:pointer-events-none disabled:opacity-50;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/globals.css
git commit -m "feat: add Tailwind v4 globals with Runwae tokens"
```

---

## Task 9: apps/web Layout, Providers, Middleware

**Files:**
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/components/providers.tsx`
- Create: `apps/web/middleware.ts`
- Create: `apps/web/app/page.tsx`

- [ ] **Step 1: Create `apps/web/app/layout.tsx`**

`ConvexAuthNextjsServerProvider` wraps the entire tree (server component); `Providers` (client) provides the Convex React client.

```tsx
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Runwae", template: "%s | Runwae" },
  description: "Plan trips, discover events, explore destinations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${bricolage.variable} ${inter.variable} antialiased`}
        >
          <Providers>{children}</Providers>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
```

- [ ] **Step 2: Create `apps/web/components/providers.tsx`**

```tsx
"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}
```

- [ ] **Step 3: Create `apps/web/middleware.ts`**

Protects all `(app)/*` routes; allows `(auth)` and `(public)` routes through.

```typescript
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/t/(.*)",
  "/e/(.*)",
  "/d/(.*)",
]);

export default convexAuthNextjsMiddleware((request, { convexAuth }) => {
  if (!isPublicRoute(request) && !convexAuth.isAuthenticated()) {
    return nextjsMiddlewareRedirect(request, "/sign-in");
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

- [ ] **Step 4: Create `apps/web/app/page.tsx`**

Root redirect — middleware handles unauthenticated users before this runs.

```tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/home");
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/layout.tsx apps/web/components/providers.tsx apps/web/middleware.ts apps/web/app/page.tsx
git commit -m "feat: add Next.js root layout with Convex Auth + middleware"
```

---

## Task 10: apps/web lib/utils.ts

**Files:**
- Create: `apps/web/lib/utils.ts`
- Create: `apps/web/lib/utils.test.ts`

- [ ] **Step 1: Write failing tests**

Create `apps/web/lib/utils.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cn, formatCurrency, formatDate, formatRelativeTime } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });
  it("deduplicates tailwind classes keeping last", () => {
    expect(cn("px-4", "px-8")).toBe("px-8");
  });
  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });
});

describe("formatCurrency", () => {
  it("formats GBP amounts", () => {
    expect(formatCurrency(1000, "GBP")).toBe("£1,000");
  });
  it("uses displayCurrency when provided", () => {
    expect(formatCurrency(1000, "GBP", "USD")).toBe("$1,000");
  });
  it("shows decimal places for fractional amounts", () => {
    expect(formatCurrency(9.99, "GBP")).toBe("£9.99");
  });
});

describe("formatDate", () => {
  it("formats epoch ms to a readable date string", () => {
    const result = formatDate(1_700_000_000_000, "Europe/London");
    expect(result).toMatch(/\d+/);
    expect(typeof result).toBe("string");
  });
  it("accepts custom Intl.DateTimeFormatOptions", () => {
    const result = formatDate(1_700_000_000_000, "Europe/London", {
      month: "short",
      day: "numeric",
    });
    expect(result).toBeTruthy();
    expect(result).not.toContain("undefined");
  });
});

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("returns a 'seconds' label for very recent past", () => {
    const result = formatRelativeTime(Date.now() - 5_000);
    expect(result).toMatch(/second|now/i);
  });
  it("returns minutes for 2 minutes ago", () => {
    const result = formatRelativeTime(Date.now() - 2 * 60 * 1000);
    expect(result).toMatch(/2 minutes? ago/i);
  });
  it("returns hours for 3 hours ago", () => {
    const result = formatRelativeTime(Date.now() - 3 * 3_600_000);
    expect(result).toMatch(/3 hours? ago/i);
  });
  it("returns days for 2 days ago", () => {
    const result = formatRelativeTime(Date.now() - 2 * 86_400_000);
    expect(result).toMatch(/2 days? ago/i);
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd apps/web && pnpm test
```

Expected: FAIL — `utils` module not found.

- [ ] **Step 3: Write `apps/web/lib/utils.ts`**

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string,
  displayCurrency?: string
): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: displayCurrency ?? currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(
  epochMs: number,
  timezone: string,
  format?: Intl.DateTimeFormatOptions
): string {
  const opts: Intl.DateTimeFormatOptions = format ?? {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return new Intl.DateTimeFormat("en-GB", {
    ...opts,
    timeZone: timezone,
  }).format(new Date(epochMs));
}

const THRESHOLDS: [number, Intl.RelativeTimeFormatUnit, number][] = [
  [60, "seconds", 1],
  [3_600, "minutes", 60],
  [86_400, "hours", 3_600],
  [604_800, "days", 86_400],
  [2_592_000, "weeks", 604_800],
  [31_536_000, "months", 2_592_000],
  [Infinity, "years", 31_536_000],
];

export function formatRelativeTime(epochMs: number): string {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diffSecs = Math.round((epochMs - Date.now()) / 1000);
  const absDiff = Math.abs(diffSecs);

  for (const [threshold, unit, divisor] of THRESHOLDS) {
    if (absDiff < threshold) {
      return rtf.format(Math.round(diffSecs / divisor), unit);
    }
  }

  return rtf.format(Math.round(diffSecs / 31_536_000), "years");
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd apps/web && pnpm test
```

Expected: All 12 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/utils.ts apps/web/lib/utils.test.ts
git commit -m "feat: add lib/utils (cn, formatCurrency, formatDate, formatRelativeTime)"
```

---

## Task 11: apps/web components/ui

**Files:** Create all 10 UI skeleton components in `apps/web/components/ui/`.

- [ ] **Step 1: Create `apps/web/components/ui/button.tsx`**

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "bg-muted text-foreground hover:bg-muted/80",
        ghost: "hover:bg-muted text-foreground",
        outline:
          "border border-border bg-transparent hover:bg-muted",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-5",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  isLoading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Create `apps/web/components/ui/badge.tsx`**

```tsx
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "primary" | "success" | "destructive" | "outline";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary text-primary-foreground",
  success: "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
  outline: "border border-border text-foreground",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 3: Create `apps/web/components/ui/avatar.tsx`**

```tsx
import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap: Record<NonNullable<AvatarProps["size"]>, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
};

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground",
        sizeMap[size],
        className
      )}
    >
      {src ? (
        <Image src={src} alt={name ?? "avatar"} fill className="object-cover" />
      ) : (
        <span aria-label={name}>{name ? initials(name) : "?"}</span>
      )}
    </span>
  );
}
```

- [ ] **Step 4: Create `apps/web/components/ui/avatar-stack.tsx`**

```tsx
import { cn } from "@/lib/utils";
import { Avatar } from "./avatar";

interface AvatarStackProps {
  users: Array<{ name?: string; avatarUrl?: string | null }>;
  max?: number;
  size?: "xs" | "sm" | "md";
  className?: string;
}

const overflowSize: Record<NonNullable<AvatarStackProps["size"]>, string> = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
};

export function AvatarStack({
  users,
  max = 4,
  size = "sm",
  className,
}: AvatarStackProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {visible.map((user, i) => (
        <Avatar
          key={i}
          src={user.avatarUrl}
          name={user.name}
          size={size}
          className="ring-2 ring-background"
        />
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-background",
            overflowSize[size]
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create `apps/web/components/ui/chip.tsx`**

```tsx
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  icon?: ReactNode;
}

export function Chip({
  className,
  selected,
  icon,
  children,
  ...props
}: ChipProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-muted",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
```

- [ ] **Step 6: Create `apps/web/components/ui/chip-row.tsx`**

```tsx
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function ChipRow({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 7: Create `apps/web/components/ui/card.tsx`**

```tsx
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { HTMLAttributes } from "react";

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-card border border-border",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardImageProps {
  src: string;
  alt: string;
  aspectRatio?: "video" | "square" | "wide";
  className?: string;
}

export function CardImage({
  src,
  alt,
  aspectRatio = "video",
  className,
}: CardImageProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        aspectRatio === "video" && "aspect-video",
        aspectRatio === "square" && "aspect-square",
        aspectRatio === "wide" && "aspect-[3/2]",
        className
      )}
    >
      <Image src={src} alt={alt} fill className="object-cover" />
    </div>
  );
}

export function CardBody({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-4", className)} {...props}>
      {children}
    </div>
  );
}
```

- [ ] **Step 8: Create `apps/web/components/ui/sheet.tsx`**

```tsx
"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, type ReactNode } from "react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Sheet({
  open,
  onClose,
  title,
  children,
  className,
}: SheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full max-w-lg rounded-t-3xl bg-card px-6 pb-8 pt-4 shadow-xl",
          className
        )}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        {title && (
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Create `apps/web/components/ui/tab-bar.tsx`**

```tsx
"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface TabBarProps {
  children: ReactNode;
  variant?: "main" | "pill";
  className?: string;
}

interface TabBarItemProps {
  href: string;
  icon?: ReactNode;
  label: string;
  className?: string;
}

export function TabBar({
  children,
  variant = "main",
  className,
}: TabBarProps) {
  return (
    <nav
      className={cn(
        "flex",
        variant === "main"
          ? "fixed bottom-0 left-0 right-0 justify-around border-t border-border bg-card pt-2 pb-6"
          : "gap-1 rounded-full bg-muted p-1",
        className
      )}
    >
      {children}
    </nav>
  );
}

export function TabBarItem({
  href,
  icon,
  label,
  className,
}: TabBarItemProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors",
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
```

- [ ] **Step 10: Create `apps/web/components/ui/date-strip.tsx`**

```tsx
"use client";

import { cn } from "@/lib/utils";
import { addDays, format, isSameDay } from "date-fns";

interface DateStripProps {
  startDate: Date;
  days?: number;
  selectedDate?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
}

export function DateStrip({
  startDate,
  days = 7,
  selectedDate,
  onSelect,
  className,
}: DateStripProps) {
  const dates = Array.from({ length: days }, (_, i) => addDays(startDate, i));

  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {dates.map((date) => {
        const active = selectedDate ? isSameDay(date, selectedDate) : false;
        return (
          <button
            key={date.toISOString()}
            onClick={() => onSelect?.(date)}
            className={cn(
              "flex shrink-0 flex-col items-center rounded-2xl px-4 py-2 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <span className="text-xs font-medium">{format(date, "EEE")}</span>
            <span className="text-lg font-semibold leading-none">
              {format(date, "d")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 11: Commit**

```bash
git add apps/web/components/
git commit -m "feat: add apps/web UI skeleton components"
```

---

## Task 12: apps/web Route Pages

**Files:** All page stubs in `app/(auth)`, `app/(app)`, and `app/(public)`.

- [ ] **Step 1: Create auth layout and pages**

`apps/web/app/(auth)/layout.tsx`:
```tsx
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
```

`apps/web/app/(auth)/sign-in/page.tsx`:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">Sign in to Runwae</p>
      </div>
      {/* Auth form goes here */}
    </div>
  );
}
```

`apps/web/app/(auth)/sign-up/page.tsx`:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Create account
        </h1>
        <p className="text-sm text-muted-foreground">Join Runwae</p>
      </div>
      {/* Auth form goes here */}
    </div>
  );
}
```

- [ ] **Step 2: Create (app) layout and pages**

`apps/web/app/(app)/layout.tsx`:
```tsx
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-20">
      {children}
      {/* TabBar navigation goes here */}
    </div>
  );
}
```

`apps/web/app/(app)/home/page.tsx`:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  return (
    <main className="px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Home</h1>
    </main>
  );
}
```

`apps/web/app/(app)/trips/page.tsx`:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Trips" };

export default function TripsPage() {
  return (
    <main className="px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">
        My Trips
      </h1>
    </main>
  );
}
```

`apps/web/app/(app)/trips/new/page.tsx`:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Trip" };

export default function NewTripPage() {
  return (
    <main className="px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">
        New Trip
      </h1>
    </main>
  );
}
```

`apps/web/app/(app)/trips/[slug]/page.tsx`:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Trip" };

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">
        {slug}
      </h1>
    </main>
  );
}
```

`apps/web/app/(app)/events/page.tsx`:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Events" };

export default function EventsPage() {
  return (
    <main className="px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Events
      </h1>
    </main>
  );
}
```

`apps/web/app/(app)/events/[slug]/page.tsx`:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Event" };

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">
        {slug}
      </h1>
    </main>
  );
}
```

`apps/web/app/(app)/explore/page.tsx`:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Explore" };

export default function ExplorePage() {
  return (
    <main className="px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Explore
      </h1>
    </main>
  );
}
```

`apps/web/app/(app)/profile/page.tsx`:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <main className="px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Profile
      </h1>
    </main>
  );
}
```

- [ ] **Step 3: Create (public) route pages**

`apps/web/app/(public)/t/[slug]/page.tsx`:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shared Trip" };

export default async function PublicTripPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-foreground">
        Trip: {slug}
      </h1>
    </main>
  );
}
```

`apps/web/app/(public)/e/[slug]/page.tsx`:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Event" };

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-foreground">
        Event: {slug}
      </h1>
    </main>
  );
}
```

`apps/web/app/(public)/d/[slug]/page.tsx`:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Destination" };

export default async function PublicDestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-foreground">
        {slug}
      </h1>
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/
git commit -m "feat: add all apps/web route stubs"
```

---

## Task 13: apps/web API Routes

**Files:**
- Create: `apps/web/app/api/webhooks/stripe/route.ts`
- Create: `apps/web/app/api/og/trip/[slug]/route.tsx`

- [ ] **Step 1: Create `apps/web/app/api/webhooks/stripe/route.ts`**

```typescript
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      // TODO: fetchMutation(api.bookings.confirmByStripeSession, { sessionId: event.data.object.id })
      break;
    }
    case "payment_intent.payment_failed": {
      // TODO: fetchMutation(api.bookings.failByPaymentIntent, { paymentIntentId: event.data.object.id })
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 2: Create `apps/web/app/api/og/trip/[slug]/route.tsx`**

```tsx
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #D40069 0%, #7c0034 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "48px",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: "-2px",
          }}
        >
          Runwae
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: 32,
            marginTop: 20,
            maxWidth: 800,
            textAlign: "center",
          }}
        >
          {decodeURIComponent(slug)}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/api/
git commit -m "feat: add Stripe webhook + OG image API routes"
```

---

## Task 14: Install Dependencies and Validate

- [ ] **Step 1: Install from repo root**

```bash
pnpm install
```

Expected: pnpm resolves the workspace graph, installs all deps for `apps/web` and both `packages/`. No peer dependency errors relating to React/Next.

- [ ] **Step 2: Run utils tests**

```bash
cd apps/web && pnpm test
```

Expected: 12 tests pass across `cn`, `formatCurrency`, `formatDate`, `formatRelativeTime`.

- [ ] **Step 3: Typecheck apps/web**

```bash
cd apps/web && pnpm typecheck
```

Expected: Zero TypeScript errors. (Convex `_generated` types won't exist yet — this is OK. The typecheck will fail only if the `_generated` import is uncommented. Keep those as `// TODO` comments until `convex dev` runs.)

- [ ] **Step 4: Validate Convex schema**

From `packages/convex/`, link to a Convex project and push the schema:

```bash
cd packages/convex && npx convex dev --once
```

Expected: Convex reads `convex/schema.ts`, validates the schema, creates `convex/_generated/`. If no project is linked yet, the CLI will prompt to create one.

- [ ] **Step 5: Commit**

```bash
git add packages/convex/convex/_generated/ packages/convex/.env.local 2>/dev/null || true
git add packages/convex/convex.json 2>/dev/null || true
git commit -m "chore: link Convex deployment and generate types" || echo "nothing to commit"
```

---

## Task 15: CLAUDE.md

**Files:**
- Create: `CLAUDE.md` (repo root)

- [ ] **Step 1: Create `CLAUDE.md`**

```markdown
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
| `schema.ts` | Full schema definition |
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

## Running Locally

```bash
# Install all workspace dependencies
pnpm install

# Terminal 1 — Convex backend
cd packages/convex && npx convex dev

# Terminal 2 — Next.js web app
cd apps/web && pnpm dev
```

Environment variables needed in `apps/web/.env.local`:
```
NEXT_PUBLIC_CONVEX_URL=https://<your-project>.convex.cloud
```

Environment variables needed in `packages/convex/.env.local` (set via Convex dashboard):
```
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md with Runwae engineering context"
```

---

## Self-Review

**Spec coverage check:**

| Requirement | Covered by task |
|-------------|----------------|
| Turborepo + pnpm at root | Task 1 |
| apps/web (Next.js 15) | Tasks 7–13 |
| packages/convex | Tasks 3–6 |
| packages/ui (empty for now) | Task 2 |
| next@15, react@19, @convex-dev/auth, convex | Task 7 (package.json) |
| tailwindcss@4, @tailwindcss/postcss | Tasks 7 + 8 |
| Bricolage Grotesque + Inter fonts | Task 9 |
| uploadthing, stripe, resend, lucide-react, clsx, tailwind-merge, date-fns, @internationalized/date | Task 7 (package.json) |
| All (auth) routes | Task 12 |
| All (app) routes | Task 12 |
| All (public) routes | Task 12 |
| API: webhooks/stripe + og/trip/[slug] | Task 13 |
| lib/utils.ts (cn, formatCurrency, formatDate, formatRelativeTime) | Task 10 |
| components/ui (Button, Badge, Avatar, AvatarStack, Chip, ChipRow, Card/CardImage/CardBody, Sheet, TabBar/TabBarItem, DateStrip) | Task 11 |
| Tailwind config extending Runwae tokens from packages/ui/tokens.ts | Tasks 2 + 8 |
| ConvexAuthNextjsServerProvider in layout.tsx | Task 9 |
| Full Runwae schema in packages/convex | Task 4 |
| Google + Password auth in auth.ts | Task 5 |
| All 13 empty stub files | Task 6 |
| npx convex dev validation | Task 14 |
| CLAUDE.md at repo root | Task 15 |

All requirements covered. No placeholders found.
