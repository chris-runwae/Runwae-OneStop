# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **web** package of the Runwae-OneStop monorepo. The monorepo also contains `mobile/` (React Native) and `supabase/` (edge functions: liteapi, viator, testEdge) at the repository root.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # TypeScript check + Vite production build (tsc -b && vite build)
npm run lint      # Run ESLint across the project
npm run preview   # Preview the production build locally
```

## Tech Stack

- **React 19** with TypeScript (~5.9), built with **Vite 7**
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (CSS-first config in `src/index.css`, no PostCSS)
- **React Router v7** with `createBrowserRouter` (data router pattern)
- **Zustand v5** for state management (`src/store/`)
- ESLint with flat config (`eslint.config.js`): recommended JS/TS rules + react-hooks + react-refresh
- Strict TypeScript: `strict`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`

## Path Aliases

`@/` maps to `src/` — configured in both `vite.config.ts` and `tsconfig.app.json`. Always use `@/` for imports.

## Fonts

- **Inter** (`font-sans`) — body text, default
- **Bricolage Grotesque** (`font-display`) — headings and display text

Loaded via Google Fonts in `src/index.css` and configured as Tailwind theme variables.

## Architecture

### Routing and Layout

`src/App.tsx` defines routes using `createBrowserRouter`. All routes are wrapped in a shared `Layout` component (`src/components/Layout.tsx`) that renders a collapsible sidebar + `<Outlet />`.

### Feature-based structure

Code is organized under `src/features/<domain>/` with this structure:
- `pages/` — page components (route targets)
- `components/` — feature-specific components
- `types.ts` — feature-specific TypeScript types

Components that could be reused across features go in `src/components/`.

### Design tokens

All colors are defined as Tailwind theme variables in `src/index.css` `@theme` block. Never hardcode hex colors in components — always use the semantic token names (e.g., `text-heading`, `bg-surface`, `border-border`).

### State management

Zustand stores live in `src/store/`. The `app-store.ts` holds app-wide UI state (e.g., sidebar open/closed).

### Icon components

SVG icons are wrapped as React components in `src/assets/icons/components/`. They accept `SVGProps<SVGSVGElement>` and use `currentColor` or explicit props (`fill`, `stroke`) for color so they can be themed dynamically (e.g., active/inactive nav states).

## Git Branching

- Main branch: `main`
- Web development branch: `web/dev`
- Feature branches follow patterns like `web/feature/<name>`
- The mobile team uses `mobile/develop` and `mobile/feature/<name>`
