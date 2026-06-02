# Replicate runwae-website-main into apps/website (verbatim)

## Context

`runwae-website-main/` is a hand-built vanilla HTML/CSS/JS site (the design source of
truth): 2 pages (`index.html`, `partners.html`), `styles.css` (~4,017 lines),
`main.js` (~387 lines, vanilla), plus `images/`, `svgs/`, and two root logos. It uses
Google Fonts (Bricolage Grotesque + Inter) over CDN and has zero JS framework deps.

`apps/website/` is a fully-built but unrelated Next.js 15 (App Router) marketing site
with its own design (Hero/Nav/Footer components, Tailwind v4, `@runwae/ui`, MDX blog,
A/B testing). Its look does NOT match the static site.

Goal: opening `apps/website` at `/` (and `/partners`) renders **exactly** like
`runwae-website-main`. Approach chosen by user: **copy the static site in verbatim**,
**replace** the existing Next scaffold, replicate **both pages** (partners images will
404 until the missing `assets/` folder is supplied — accepted).

Strategy: keep `styles.css` + `main.js` byte-for-byte in `public/`, keep the HTML
bodies intact, and inject each page's `<body>` markup via `dangerouslySetInnerHTML` so
the static CSS/JS run unchanged. This avoids a 4,000-line CSS / 1,500-line HTML
JSX-rewrite and its visual-drift risk.

## Changes

### 1. Copy static assets into `apps/website/public/` (verbatim, same filenames)
- `public/styles.css`  ← `runwae-website-main/styles.css`
- `public/main.js`     ← `runwae-website-main/main.js`
- `public/logo.png`, `public/logo-white.png`
- `public/images/*`    (all 20 files)
- `public/svgs/*`      (all 3 files)
- `public/assets/`     create empty (placeholder for partners.html's missing images)

Why root-level: the HTML uses relative asset paths (`styles.css`, `images/x.png`,
`svgs/x.svg`, `logo.png`). With Next clean routes (no trailing slash), relative paths
from both `/` and `/partners` resolve to root (`/images/x.png`), so they work unchanged.

### 2. Keep the HTML bodies as source files, read at build time
- Store `index.html` and `partners.html` at `apps/website/static-html/`.
- Make ONLY these minimal edits to internal navigation links (assets untouched):
  - `partners.html` (href) → `/partners`, preserving hashes (`partners.html#travel-partner` → `/partners#travel-partner`)
  - `index.html` (href) → `/`
- Add helper `apps/website/lib/static-html.ts`:
  - reads a file from `static-html/` via `node:fs/promises` + `path.join(process.cwd(), ...)`
  - returns the inner `<body>…</body>` HTML with the trailing `<script src="main.js">` line stripped (main.js is loaded by the layout instead).

### 3. Rewrite `app/layout.tsx` to a minimal verbatim shell
Replace current layout (drop `globals.css`/Tailwind/`@runwae/ui`, next/font, PostHog,
Analytics, SpeedInsights, OrganizationJsonLd — these would collide with `styles.css` or
add noise). New layout `<head>` contains, verbatim from the static `<head>`:
- the two `<link rel="preconnect">` font tags
- the Google Fonts `<link>` (Bricolage Grotesque 400–800 + Inter 400–700)
- `<link rel="stylesheet" href="/styles.css" />`
Body renders `{children}` and loads `<Script src="/main.js" strategy="afterInteractive" />`
(next/script). main.js's `ready()` runs init immediately post-hydration since the
injected DOM is already present.

### 4. Page routes
- `app/page.tsx` (home): `export const dynamic = "force-static"`; server component reads
  `index.html` body via the helper and renders `<div dangerouslySetInnerHTML={…} />`.
  `export const metadata` = title/description copied verbatim from `index.html` head.
- `app/partners/page.tsx`: same, from `partners.html`. Additionally re-add partners.html's
  head `<style>` override (`body{background:var(--bg-dark);color:var(--white)}`) as a
  `<style>` tag in this page (it lives in the static `<head>`, not the body, so the body
  injection would otherwise drop it).

### 5. Remove the existing scaffold (the "replace" decision)
Delete the unrelated Next content so it can't conflict:
- `app/(marketing)/`, `app/blog/`, `app/lp/`, `app/og/`, `app/api/`
- `app/globals.css`, `app/not-found.tsx`, `app/robots.ts`, `app/sitemap.ts`
- `components/` (marketing components, posthog-provider, organization-json-ld, mdx-components)
- `content/`, `lib/mdx.ts`, `lib/flags.ts`, `lib/site.ts`, `lib/cn.ts`
- `middleware.ts` (A/B cookie middleware — depends on the deleted `lib/flags`)
Keep: `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `package.json`
(unused deps left in place; can be trimmed later).

## Files touched (representative)
- New: `apps/website/public/{styles.css,main.js,logo.png,logo-white.png,images/*,svgs/*}`
- New: `apps/website/static-html/{index.html,partners.html}` (with link edits)
- New: `apps/website/lib/static-html.ts`, `apps/website/app/partners/page.tsx`
- Rewritten: `apps/website/app/layout.tsx`, `apps/website/app/page.tsx`
- Deleted: scaffold dirs/files listed in §5

## Verification
1. `pnpm --filter @runwae/website dev` (serves on :3003).
2. Open `http://localhost:3003/` and a `file://` of `runwae-website-main/index.html`
   side by side — confirm pixel-identical (hero, bento grid, marquee, how-it-works,
   features grid, FAQ accordion, footer). Use Claude_Preview / screenshots to compare.
3. Verify interactions driven by `main.js`: sticky nav, mobile drawer, FAQ accordion,
   waitlist/contact modals, marquee pause-on-hover, scroll-reveal animations,
   how-it-works auto-cycle.
4. Open `/partners`: tab toggle (Event Host / Travel Partner), sub-tabs (Hotels /
   Activities), hash routing (`#travel-partner`), dark-bg override applied. Expect the
   `assets/*` images to 404 (known, pending asset delivery) — layout/styles intact.
5. Confirm cross-page nav: home "Partner" link → `/partners`, and back.
6. `pnpm --filter @runwae/website build` compiles clean (both routes statically generated).

## Notes / follow-ups
- partners.html needs the 12 `assets/` images (Frame*/Group* PNGs) to render fully; drop
  them into `public/assets/` when available — no code change needed.
- Per user convention, the implementation spec will also be saved to
  `docs/website-replication-spec.md` during execution.
