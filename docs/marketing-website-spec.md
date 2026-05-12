# Marketing Website Migration — Framer → Next.js

## Context

`runwae.io` currently runs on Framer. The published sitemap is just four
pages: `/`, `/hosts`, `/partners`, `/about`. The goal of this migration is
to move the marketing surface into the monorepo so we can:

- ship server-rendered pages with much lower TTFB than a Framer SPA
- own the SEO surface (meta, sitemap, structured data, OG images)
- run A/B tests on hero copy and full landing pages without flicker
- spin up campaign-specific landing pages from MDX in seconds
- publish long-tail blog posts that compound organic search traffic

A new workspace at `apps/website/` will house the new site. It will be
decoupled from Convex (no auth, no live data) so the site can be deployed
independently on Vercel and stay fast.

### Decisions locked in (user confirmed)

| Question | Decision |
|---|---|
| Content management | **MDX in repo** — blog posts and landing pages as `.mdx` files |
| Monorepo integration | **Mirror tokens, otherwise decoupled** — share `packages/ui` design tokens, no Convex dependency |
| A/B testing | **Vercel Flags + Edge Config** — middleware-resolved, SEO-safe |
| Assets | User will **export hero/screenshot assets from Framer** |

## What's on the Framer site today (verbatim copy where captured)

### `/` (Home)
- Top nav: Company · Features · Partners · Log In · Get Started
- Hero: **"Plan Together. Book Together. Split the Cost."** — "Runwae is the all-in-one app for groups — discover events, build itineraries, and handle payments without the chaos." CTAs: *Become a partner*, *Get the app*.
- "Built for friends, creators & communities." — long-form intro ending with "Learn More" → /about.
- Featured-categories grid (10 items, "Festivals" placeholders visible).

### `/about`
- Hero: **"Built for the way you gather."**
- Stats strip: 100+ trips planned monthly · $0 platform fee · 180+ cities · 4.9★
- Mission, "Who Are We?", "Why We Started"
- "Partner with us!" with two CTAs (travel partner / event host)
- 6-question FAQ
- App Store + Google Play badges

### `/partners` (Travel partners)
- Hero: **"Get Booked by Event Crowds."** — "Connect with travelers when they're already in your city for events."
- Sections: Get Found by Event Groups · Work Directly with Event Hosts · Group Bookings Made Easy · Fill Your Slow Nights · Keep More Money
- Commission visualization ($34,056/mo · 321 bookings)
- 4-step onboarding
- "I'm an Event Host" / "I'm a Travel Partner" CTAs

### `/hosts` (Event hosts)
- Hero: dashboard mockup + **"Your attendees are already spending. Now you can earn from it."**
- Features: Your Own Travel Hub · New Revenue Stream · Attendee Perks You Control · Better Coordination · See What's Happening (analytics)
- 4-step setup process
- App-store CTAs

### Footer (shared)
- Columns: Company (About · How it Works · Privacy · Terms) · Features (Group Planning · One-stop App) · Partner (Travel Partner · Event Host) · Help (Contact · Help Center · FAQs)
- Socials: Instagram · Twitter/X · LinkedIn
- Contact: mo@runwae.io · +1 469 544 8447
- © 2026 Runwae, Inc.

## Architecture

```
apps/website/
├── app/
│   ├── (marketing)/
│   │   ├── layout.tsx              # Nav + Footer
│   │   ├── page.tsx                # /
│   │   ├── about/page.tsx
│   │   ├── hosts/page.tsx
│   │   ├── partners/page.tsx
│   │   └── _components/            # Hero, StatsStrip, FeatureGrid, FAQ, AppStoreBadges, CTASection, Nav, Footer
│   ├── blog/
│   │   ├── page.tsx                # blog index
│   │   └── [slug]/page.tsx
│   ├── lp/[slug]/page.tsx          # campaign landing pages
│   ├── api/waitlist/route.ts       # POST → Resend audience
│   ├── og/[...slug]/route.ts       # @vercel/og dynamic OG images
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── layout.tsx                  # html shell + fonts + analytics
│   └── globals.css                 # Tailwind v4 @theme tokens
├── content/
│   ├── blog/*.mdx
│   └── lp/*.mdx
├── lib/
│   ├── mdx.ts                      # fs + frontmatter parsing
│   ├── flags.ts                    # @vercel/flags declarations
│   └── analytics.ts                # PostHog client
├── public/                         # exported Framer assets land here
├── middleware.ts                   # variant resolution (cookie-stickied)
├── next.config.ts
├── tsconfig.json
└── package.json
```

### Stack

- Next.js 15 App Router (match `apps/web` version)
- TypeScript, ESLint — same config style as `apps/web`
- Tailwind v4 CSS-first (`@import "tailwindcss"` + `@theme { … }`), no `tailwind.config.ts`
- `next/font` for Bricolage Grotesque (display) + Inter (body)
- `next-mdx-remote/rsc` for MDX rendering inside RSC
- `@vercel/flags` + `@vercel/edge-config` for experiments
- `@vercel/og` for branded social-share images
- PostHog (mirror pattern from `apps/web/components/providers.tsx`)
- Vercel Analytics + Speed Insights
- Resend for waitlist captures

### Rendering strategy

- All marketing pages: `export const dynamic = 'force-static'` + revalidate yearly. They go straight to the edge cache.
- Blog & LP pages: `generateStaticParams` from filesystem + ISR (`revalidate = 86400`).
- Middleware runs only on the homepage initially, sets a `rw_variant_*` cookie, rewrites to the same path. No URL pollution → no canonical-tag issues for SEO.

## Step-by-step plan

### 1. Workspace scaffold
- Create `apps/website/` mirroring `apps/web/` minimally: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`.
- Port: pick `3003` (web=3000, admin=3001, hosts=3002).
- Verify `pnpm install && pnpm dev --filter=website` boots.

### 2. Design system mirror
- Read `packages/ui/tokens.ts` and `apps/web/app/globals.css` — copy the token surface (primary `hsla(327, 99%, 42%, 1)`, neutrals, fonts, radii) into `apps/website/app/globals.css` `@theme {}` block.
- Add a project-level `cn()` import from `packages/ui` (path alias `@runwae/ui` if it exists, or relative). Reuse `Button`, `Card`, `Badge` from `packages/ui/components`.
- Set up `next/font` for Bricolage_Grotesque + Inter in `app/layout.tsx`.
- Light-only theme for v1 (skip `.dark` class).

### 3. Marketing chrome (Nav + Footer)
- Build `_components/Nav.tsx` and `_components/Footer.tsx` matching the Framer columns/links above.
- Nav items: Company → /about · Features (anchor) · Partners → /partners · Log In → app.runwae.io · Get Started → app-store badges modal.
- Footer matches the column structure captured above.

### 4. Build the four pages
For each: a page module composes section components from `_components/`. Page-specific copy lives in colocated TS const objects (these are bespoke, not MDX). Each page exports `generateMetadata` with title, description, og image.

- `/` → Hero, BuiltFor, FeatureGrid, CTABanner, AppStoreBadges
- `/about` → Hero, StatsStrip, MissionBlock, PartnerCTA, FAQ
- `/partners` → Hero, FeatureColumns, CommissionPreview, FourStepProcess, FinalCTA
- `/hosts` → Hero (with dashboard mockup), FeatureGrid, FourStepProcess, AppStoreCTA

### 5. Blog (MDX)
- Add `next-mdx-remote@^5`, `gray-matter`, `remark-gfm`.
- `lib/mdx.ts`: reads `content/blog/*.mdx`, parses frontmatter (`title`, `description`, `slug`, `date`, `coverImage`, `tags`, `author`).
- `/blog` lists posts sorted by date.
- `/blog/[slug]` uses `generateStaticParams` + renders MDX inside an `<Article>` shell.
- Seed: `content/blog/welcome-to-runwae.mdx` so the route exists for QA.
- Article JSON-LD via `generateMetadata`.

### 6. Custom landing pages (MDX)
- `content/lp/*.mdx` with frontmatter: `slug`, `hero`, `subhero`, `cta`, `ogTitle`, `theme` (e.g. `festival`, `creator-retreat`).
- `/lp/[slug]/page.tsx` reads MDX + wraps in a `LandingPageLayout` that reuses the marketing section components.
- `notFound()` on missing slug.
- Seed: `content/lp/festival-travel.mdx` for a sample campaign page.

### 7. A/B testing wiring
- `lib/flags.ts`: declare flags using `@vercel/flags/next` (e.g. `homeHeroVariant`).
- `middleware.ts`: resolves the variant, sets `rw_variant_home_hero` cookie if absent, rewrites to the same path. Matcher limited to `/` initially.
- Pages read the cookie via `cookies()` from `next/headers` to pick variant copy.
- Emit `posthog.capture('$feature_flag_called', { flag, variant })` on first paint so PostHog dashboards work.
- Add a sample variant on the home hero copy as the first experiment.

### 8. SEO infrastructure
- `app/sitemap.ts` — emits `/`, `/about`, `/hosts`, `/partners`, all `/blog/[slug]`, all `/lp/[slug]`.
- `app/robots.ts` — Allow all.
- Per-page `generateMetadata` with canonical URLs.
- `app/og/[...slug]/route.ts` via `@vercel/og` — branded image (logo + page title) with `runtime = 'edge'`.
- JSON-LD: `Organization` on root layout; `Article` on blog; `FAQPage` on /about (matches the 6 questions).

### 9. Waitlist + analytics
- `app/api/waitlist/route.ts` (Node runtime): zod-validate email + honeypot, call Resend audiences API, return 204. Rate-limit by IP via Upstash (skip if not installed; cookie-based local fallback OK for v1).
- PostHog provider in `app/layout.tsx` (copy structure from `apps/web/components/providers.tsx`).
- `@vercel/analytics` + `@vercel/speed-insights` script tags.

### 10. Deploy
- New Vercel project `runwae-website`, link via `vercel link`.
- Env: `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`, `EDGE_CONFIG`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`.
- Stage at `next.runwae.io` first. Run Lighthouse on all four pages.
- Cutover: re-point `runwae.io` apex DNS to Vercel once parity confirmed.

## Critical files to be created

- `apps/website/package.json`
- `apps/website/tsconfig.json`
- `apps/website/next.config.ts`
- `apps/website/middleware.ts`
- `apps/website/app/layout.tsx`
- `apps/website/app/globals.css`
- `apps/website/app/(marketing)/layout.tsx`
- `apps/website/app/(marketing)/page.tsx`
- `apps/website/app/(marketing)/about/page.tsx`
- `apps/website/app/(marketing)/hosts/page.tsx`
- `apps/website/app/(marketing)/partners/page.tsx`
- `apps/website/app/(marketing)/_components/` (Nav, Footer, Hero, StatsStrip, FeatureGrid, FAQ, AppStoreBadges, CTASection)
- `apps/website/app/blog/page.tsx`
- `apps/website/app/blog/[slug]/page.tsx`
- `apps/website/app/lp/[slug]/page.tsx`
- `apps/website/app/api/waitlist/route.ts`
- `apps/website/app/og/[...slug]/route.ts`
- `apps/website/app/sitemap.ts`
- `apps/website/app/robots.ts`
- `apps/website/lib/{mdx,flags,analytics}.ts`
- `apps/website/content/blog/welcome-to-runwae.mdx`
- `apps/website/content/lp/festival-travel.mdx`

## Existing utilities to reuse

- `packages/ui/tokens.ts` — canonical color/font tokens, mirrored into `apps/website/app/globals.css`
- `packages/ui/lib/cn.ts` — `cn()` className merger
- `packages/ui/components/*` — Button, Card, Badge, Accordion (for FAQ)
- `apps/web/app/globals.css` — reference for the Tailwind v4 `@theme` block syntax
- `apps/web/components/providers.tsx` — reference pattern for PostHog provider wiring
- `apps/web/next.config.ts` — reference for image remote patterns (we'll keep Vercel blob + utfs.io even if not used initially)

## Verification

- `pnpm install` succeeds (lockfile picks up the new workspace).
- `pnpm dev --filter=website` boots at `http://localhost:3003`.
- All four marketing pages render with consistent nav/footer and copy that matches the Framer site (compare side-by-side in two browser windows).
- `/blog` renders the seed post; `/blog/welcome-to-runwae` renders the MDX article shell.
- `/lp/festival-travel` renders the sample landing page.
- Setting cookie `rw_variant_home_hero=v1` and reloading `/` swaps the hero copy without a flicker.
- `/sitemap.xml` lists all routes including the seed blog and LP slugs.
- `/robots.txt` allows all.
- `/og/home.png` returns a valid 1200×630 PNG with the page title.
- Lighthouse on `/` (mobile): Performance ≥ 95, SEO 100, Accessibility ≥ 95.
- `pnpm typecheck --filter=website` exits 0.
- `pnpm build --filter=website` produces static HTML for marketing routes (verify under `apps/website/.next/server/app/(marketing)/`).

## Out of scope for v1

- Full blog content library — one seed post only.
- Custom illustrations and animation — waiting on Framer asset export; placeholders until then.
- Localization — single locale (`en`).
- Email automation beyond Resend audience capture.
- The vendor/host management dashboard (lives in `apps/hosts/`, separate concern).

## Risks & mitigations

- **Token drift between `apps/web` and `apps/website`.** Both apps mirror `packages/ui/tokens.ts` into their own `globals.css`; nothing enforces parity. *Mitigation*: a follow-up task to extract a shared `globals.css` snippet in `packages/ui/styles/` that both apps `@import`.
- **Framer asset export gaps** (custom illustrations, Lottie/animations). *Mitigation*: Phase 4 ships with placeholder media; swap in assets as they arrive.
- **Variant pages hurting SEO if crawled.** Variants are resolved via cookies, not URL parameters, and the canonical URL is unchanged — Googlebot sees the control. Confirm with Search Console after launch.
- **Convex coupling later.** If the waitlist needs to merge with the consumer user pool, the `/api/waitlist` route is the single seam where we'd add a Convex mutation.
