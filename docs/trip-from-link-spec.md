# Trip-From-Link Spec

Generate a trip + itinerary from a YouTube or TikTok URL pasted into the mobile home-screen search bar. Whisper transcribes the audio (or YouTube captions are read directly), Claude Haiku 4.5 extracts the destination + day-by-day itinerary, and the existing `_materializeFreeFormTrip` pipeline writes it to Convex.

## Context

- The mobile home screen already has a "Search or paste link" entry that opens a search screen with URL detection and a "Create Itinerary" button — but the button currently navigates to `/trips` without passing the URL. This spec wires it up end-to-end.
- The Convex backend already has Claude wired (`packages/convex/convex/ai.ts`), a quota system, idempotency, and a free-form trip materializer. We extend it; we don't duplicate it.
- No Whisper / yt-dlp / OpenAI / Groq integration exists yet. We add a Vercel extractor route + Groq Whisper, both reachable from a new Convex action.

Decisions captured from clarification:
- **Platforms at launch:** YouTube + TikTok. (Instagram deferred — the most fragile due to login walls.)
- **Audio extractor:** self-hosted Vercel route under `apps/web/app/api/extract-media/route.ts` using `yt-dlp-exec`.
- **Async UX:** **hybrid** — inline await for short videos (≤4 min), escalate to background job for longer videos.

## Architecture

```
Mobile  /search                                        Convex                              External
──────────────────────                                 ─────────────                       ──────────
1. user pastes URL
2. link-preview-js renders OG card           ┐
3. user taps "Create Itinerary" ─────────────┘
   client mints idempotencyKey
   router.push("/create-trip-from-link", {url, …})
                                                      api.ai.generateTripFromUrl(args)
                                                      ├─ idempotency lookup (trips.by_ai_key)
                                                      ├─ quota reserve
                                                      ├─ detect platform (youtube|tiktok)
                                                      ├─ probe duration via extractor
                                                      │    POST /api/extract-media?probe=1 ─►  Vercel route
                                                      │                                        (yt-dlp --print duration)
                                                      ├─ if dur > 240s → write media_imports row,
                                                      │     scheduler.runAfter(0, _processImport),
                                                      │     return {ok:true, mode:"background", importId}
                                                      └─ else (inline path):
                                                           ├─ get transcript:
                                                           │    YT: youtubei timedtext (no key)
                                                           │    TT: extractor returns audio → ─► Groq Whisper
                                                           │                                     (whisper-large-v3-turbo)
                                                           ├─ Claude Haiku extraction (new prompt)
                                                           ├─ _fetchProviderCandidates (Viator/LiteAPI)
                                                           ├─ _materializeFreeFormTrip (with sourceUrl/Type)
                                                           └─ _unsplashBackfill
                                                           returns {ok:true, mode:"inline", tripId, slug, remaining}

Background path: same steps run inside internal action _processImport; mobile subscribes
to media_imports row via useQuery and renders a home-screen progress pill.
```

## New files

| Path | Purpose |
|---|---|
| `apps/mobile/app/create-trip-from-link.tsx` | Loading sheet that awaits inline or pivots to "we'll keep working in background" + Done state. Mirrors `create-trip-ai.tsx` building/success steps. |
| `apps/mobile/components/ai-trip/LinkBuildingStep.tsx` | Stage indicator: Reading link → Watching video → Drafting itinerary → Adding photos & maps. |
| `apps/mobile/components/home/ImportsInProgressPill.tsx` | Home-screen pill subscribed to `api.media.myActiveImports`. Tap → resume loading screen for that import. Reused from background path. |
| `packages/convex/convex/media.ts` | Public action `generateTripFromUrl` orchestrator. Internal helpers: `_probeDuration`, `_fetchYouTubeCaptions`, `_callExtractor`, `_callGroqWhisper`, `_processImport` (background), `_setImportStatus`. Public query `myActiveImports`. |
| `packages/convex/convex/lib/urlPlatform.ts` | Pure `detectPlatform(url)`, canonicalizer (strip tracking params, expand `vt.tiktok.com` short links). Exportable to mobile via shared snippet. |
| `apps/mobile/lib/urlPlatform.ts` | Mirror of the Convex helper for client-side platform detection on the search screen. |
| `apps/web/app/api/extract-media/route.ts` | Vercel Node function, `runtime: "nodejs"`, `maxDuration: 60`. Uses `yt-dlp-exec`. Auth-gated by `MEDIA_EXTRACTOR_SECRET`. Returns `{audioUrl, durationSec, title, description, thumbnail, creator}`. Supports `?probe=1` to return only duration + metadata (no audio). |

## Files to modify

- **`apps/mobile/app/search.tsx`** lines 212–219 — change "Create Itinerary" `onPress` to detect platform and `router.push({ pathname: '/create-trip-from-link', params: { url, title, image, idempotencyKey } })`. If platform is unsupported, keep the existing `/trips` fallback and show a toast.
- **`apps/mobile/app/_layout.tsx`** — register `create-trip-from-link` Stack.Screen with same nav-bar config as `create-trip-ai` (lines ~127, 166, 243).
- **`apps/mobile/hooks/useAiTripActions.ts`** — append `useGenerateTripFromUrl` (`useAction(api.media.generateTripFromUrl)`) and `useMyActiveImports` (`useQuery(api.media.myActiveImports)`).
- **`apps/mobile/app/(tabs)/index.tsx`** — render `<ImportsInProgressPill />` above the existing scroll content.
- **`apps/mobile/components/home/HomeQuickActions.tsx`** lines 45–56 — refresh copy on the existing "NEW: Paste a Link" callout to read "YouTube & TikTok supported".
- **`packages/convex/convex/ai.ts`** — add `callClaudeForUrlItinerary` helper + the prompt constants. Reuse `_findExistingByIdempotency`, `_checkAndReserveQuota`, `_refundQuota`, `_fetchProviderCandidates`, `_unsplashBackfill`. The new public action lives in `media.ts` and calls these through `internal.ai.*`.
- **`packages/convex/convex/ai.ts` `_materializeFreeFormTrip`** (lines ~1027–1098) — accept new optional args `sourceUrl`, `sourceType`, `sourceTitle`, `sourceCreator` and pass them to `ctx.db.insert("trips", …)`.
- **`packages/convex/convex/schema.ts`** — see Schema changes below.

## Convex action signature

```ts
// packages/convex/convex/media.ts
export const generateTripFromUrl = action({
  args: {
    url: v.string(),
    idempotencyKey: v.optional(v.string()),
    title: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("private"), v.literal("public"), v.literal("unlisted"))),
    tripLengthDaysOverride: v.optional(v.number()),
    startDateOverride: v.optional(v.string()), // YYYY-MM-DD
  },
  handler: async (ctx, args): Promise<
    | { ok: true; mode: "inline"; tripId: Id<"trips">; slug: string; remaining: number; reused?: boolean }
    | { ok: true; mode: "background"; importId: Id<"media_imports">; remaining: number }
    | { ok: false; reason:
          | "not_authenticated" | "quota_exhausted" | "unsupported_platform"
          | "video_too_long"            // > 20 min hard cap
          | "transcript_unavailable" | "transcript_empty"
          | "extractor_unreachable" | "ai_failed" }
  > => { /* … */ }
});
```

Threshold: `durationSec ≤ 240` → inline; `> 240` and `≤ 1200` → background; `> 1200` → reject with `video_too_long`.

## Schema changes

Add to `trips` (around line 260 in `packages/convex/convex/schema.ts`):
- `sourceUrl: v.optional(v.string())` (canonicalized)
- `sourceType: v.optional(v.union(v.literal("youtube"), v.literal("tiktok")))`
- `sourceTitle: v.optional(v.string())`
- `sourceCreator: v.optional(v.string())`
- New index: `.index("by_source_url", ["sourceUrl"])`

New table (required for hybrid async path):

```ts
media_imports: defineTable({
  userId: v.id("users"),
  url: v.string(),
  platform: v.union(v.literal("youtube"), v.literal("tiktok")),
  status: v.union(
    v.literal("queued"), v.literal("extracting"), v.literal("transcribing"),
    v.literal("planning"), v.literal("materializing"), v.literal("done"),
    v.literal("failed")
  ),
  durationSec: v.optional(v.number()),
  transcript: v.optional(v.string()),
  videoTitle: v.optional(v.string()),
  videoCreator: v.optional(v.string()),
  thumbnailUrl: v.optional(v.string()),
  tripId: v.optional(v.id("trips")),
  slug: v.optional(v.string()),
  errorReason: v.optional(v.string()),
  idempotencyKey: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_user_active", ["userId", "status"])
  .index("by_idempotency", ["idempotencyKey"])
```

## External services + env vars

| Service | Env var(s) | Where |
|---|---|---|
| Anthropic Claude | `ANTHROPIC_API_KEY` (existing) | Convex |
| Groq Whisper (`whisper-large-v3-turbo`) | `GROQ_API_KEY` (new) | Convex |
| YouTube `timedtext` captions | none (public endpoint); optional `YOUTUBE_API_KEY` for richer metadata | Convex |
| Vercel extractor route | `MEDIA_EXTRACTOR_SECRET` (new, shared); `MEDIA_EXTRACTOR_URL` (new, on Convex) | Vercel + Convex |

Vercel route uses `yt-dlp-exec` (bundles a static yt-dlp binary). On `?probe=1` it runs `yt-dlp --skip-download --print "%(duration)s|%(title)s|%(description)s|%(uploader)s|%(thumbnail)s"`. Otherwise it returns a signed/short-lived audio URL by piping `yt-dlp -f bestaudio --get-url`. Authorize requests with `Authorization: Bearer <MEDIA_EXTRACTOR_SECRET>`.

## Prompt design (Claude Haiku 4.5)

System prompt (extends the existing JSON-only constraint from `callClaudeForFreeFormItinerary`):

> You are extracting a travel itinerary from a creator's video. Treat the transcript as ground truth for places mentioned. Infer the destination from the most-mentioned city/region. When the creator names specific restaurants, viewpoints, or activities, include them as items with `locationName` set to the actual venue name (not a generic descriptor) so we can geocode them. Never invent named venues that aren't in the transcript or video metadata.

User prompt shape:

```
Today's date: {todayISO}
Source: {platform} — "{videoTitle}" by {creator}
Description: {description}
Hashtags: {tags}

Transcript (mm:ss markers when available):
{transcript}

Constraints:
- Output strict JSON: { destinationLabel, destinationCoords?, suggestedTripLengthDays (2–7, default 4),
  preferences (3–6 short tags inferred from vibe), days[] }.
- Date inference: if no dates, set day1 = first Monday ≥ {todayISO+30d}.
  If tripLengthDaysOverride is set ({tripLengthDaysOverride}), honor it.
- days[] follows the existing AiDay shape (date, dayNumber, title, items[]).
- Bias item types to what the creator actually does (food → restaurant, museum/hike → activity, club → event).
- Each item.locationName MUST be a real, geocodable name from the transcript when possible.
```

Output reuses the existing `AiDay[]` validator from `ai.ts`. After parsing, run `_fetchProviderCandidates(destinationLabel, dates)` + the existing Viator/LiteAPI matcher to bind `apiSource`/`apiRef`, then `_unsplashBackfill` for missing images.

## Error handling matrix

| Reason | Trigger | Quota refund? | Mobile UI |
|---|---|---|---|
| `unsupported_platform` | `detectPlatform === "unknown"` | not reserved | Toast "Only YouTube & TikTok for now" |
| `video_too_long` | duration > 1200s | refund | Toast + offer free-form wizard |
| `transcript_unavailable` | YT no captions AND extractor 4xx/5xx | refund | "We couldn't read this video — try another" |
| `transcript_empty` | Whisper returned <30 chars | refund | Same as above |
| `extractor_unreachable` | Vercel route timeout/5xx | refund | Toast + retry button |
| `ai_failed` | Claude bad JSON / 5xx / parse error | refund | "Couldn't draft itinerary — retry" |
| `quota_exhausted` | reserve fails | n/a | Existing paywall sheet |
| Idempotent replay | `_findExistingByIdempotency` hits | no change | Skip loading, jump to existing trip |

## Hybrid async UX details

- `create-trip-from-link.tsx` calls `generateTripFromUrl`. While the action is in flight, render the staged loading screen.
- If the action returns `mode: "inline"` → fade to success step → router.replace to `/trips/[slug]`.
- If it returns `mode: "background"` → animate copy: "This is a long video — we'll keep working in the background. We'll let you know when it's ready." Then `router.replace("/(tabs)")`. The home-screen `<ImportsInProgressPill />` is already subscribed to `myActiveImports` and surfaces progress + a tap target that re-opens `/create-trip-from-link?importId=…` to view live status (or jump to the trip when status is `done`).
- Background processing: the action calls `ctx.scheduler.runAfter(0, internal.media._processImport, {importId})` and returns. `_processImport` walks the same pipeline (transcribe → Claude → materialize), updating `media_imports.status` at each phase so the pill animates.
- Push notification on completion is **out of scope for v1** — the home pill is enough. Add later when a notifications service exists.

## Verification plan

1. Sample URLs (commit to `docs/trip-from-link-test-urls.md` for QA reference):
   - YouTube long-form with captions (8-min Tokyo food tour) — captions path, inline.
   - YouTube Short (<60s) — captions path, inline.
   - YouTube travel vlog 12 min — captions path, **background** (>4 min).
   - TikTok "Lisbon in 48 hours" 60s — Whisper path, inline.
   - TikTok 5-min compilation — Whisper path, **background**.
   - Twitter/X URL — expect `unsupported_platform` toast.
2. Convex log markers to grep for during dev:
   - `[media] platform=youtube duration=480 → background`
   - `[media] yt captions ok len=2.3KB`
   - `[media] groq whisper ok 1.8s`
   - `[ai] url-itinerary parsed days=4 dest="Tokyo, JP"`
3. Mobile UI states verified by hand on simulator:
   - Loading sheet stages animate in order; success step shows trip title + redirects.
   - Background pivot copy renders; home pill appears within 1s of returning to home.
   - Idempotent re-paste of same URL within 24h opens the same trip without burning a quota slot (assert `aiTripsUsed` unchanged).
   - Quota-exhausted state opens existing paywall sheet (parity with `create-trip-ai`).
4. Latency budgets to record (Convex log timer at each phase): YT captions <1s; Groq Whisper <8s for 3-min audio; Claude <6s; total <20s p50 inline. Alert in dev if any phase doubles.
5. End-to-end smoke: paste each fixture URL into the production mobile build pointing at staging Convex; confirm trip appears in profile, sourceUrl + sourceCreator populated, itinerary days match transcript places (spot-check 3 items per fixture).

## Out of scope (v1)

- Instagram support (login wall fragility — defer).
- Push notifications when background imports complete (home-screen pill is sufficient).
- A separate `aiImportsUsed` counter — paste-link burns one slot from the existing `aiTripsUsed`.
- Re-running an existing import with different overrides — for v1, idempotency strictly dedupes; user creates a new trip via free-form wizard if they want a different shape.

## Critical files

- `packages/convex/convex/media.ts` (new)
- `packages/convex/convex/ai.ts` (extend `_materializeFreeFormTrip`, add `callClaudeForUrlItinerary`)
- `packages/convex/convex/schema.ts` (trips fields + `media_imports` table)
- `packages/convex/convex/lib/urlPlatform.ts` (new)
- `apps/web/app/api/extract-media/route.ts` (new Vercel route)
- `apps/mobile/app/search.tsx` (wire button at line 212)
- `apps/mobile/app/create-trip-from-link.tsx` (new)
- `apps/mobile/app/_layout.tsx` (register screen)
- `apps/mobile/hooks/useAiTripActions.ts` (add hooks)
- `apps/mobile/components/ai-trip/LinkBuildingStep.tsx` (new)
- `apps/mobile/components/home/ImportsInProgressPill.tsx` (new)
- `apps/mobile/app/(tabs)/index.tsx` (render pill)
