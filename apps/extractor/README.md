# @runwae/extractor

Standalone yt-dlp + Groq Whisper service for the trip-from-link
pipeline. Runs on Fly.io and is reached by Convex via the
`MEDIA_EXTRACTOR_URL` env var.

## Why it exists

YouTube and TikTok aggressively rate-limit datacenter IPs (Vercel,
AWS, GCP). Running yt-dlp on a Fly machine in `lhr` keeps the
success rate high enough for TestFlight scale. The earlier
implementation lived as a Next.js route at
`apps/web/app/api/extract-media/route.ts` (Vercel); this directory
supersedes it. Convex doesn't care which host — it just hits
whatever URL is in `MEDIA_EXTRACTOR_URL`.

## Contract

Same as the previous Next.js route:

- `POST /api/extract-media?probe=1`
  - Body: `{ "url": "<https://…>" }`
  - Auth: `Authorization: Bearer <MEDIA_EXTRACTOR_SECRET>`
  - Response: `{ durationSec, title, description, uploader, thumbnail }`

- `POST /api/extract-media` (no `probe=1`)
  - Same body + auth.
  - Response: `{ transcript: string }` — Groq Whisper output.
  - Audio bytes never leave this host; only the text flows back to
    Convex. This is what keeps us under Convex's 16 MiB action-return
    limit even when TikTok serves a 21 MiB combined video.

- `GET /health` — `{ ok: true, … }`. Used by Fly's health checks.

## Local development

```bash
pnpm install
export MEDIA_EXTRACTOR_SECRET=$(openssl rand -hex 32)
export GROQ_API_KEY=gsk_...
export YT_DLP_BIN=$(which yt-dlp)    # brew install yt-dlp first
pnpm dev
```

Then in another terminal:
```bash
curl -X POST "http://localhost:8080/api/extract-media?probe=1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MEDIA_EXTRACTOR_SECRET" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

## Deploying to Fly.io (first time)

```bash
brew install flyctl
flyctl auth signup   # or `flyctl auth login` if you already have an account

cd apps/extractor

# Edit fly.toml — the `app` name must be globally unique.
# E.g. change `runwae-extractor` to `runwae-extractor-prod`.

flyctl launch --no-deploy --copy-config
# Accept the existing fly.toml when prompted. Skip Postgres / Redis.

flyctl secrets set \
  MEDIA_EXTRACTOR_SECRET="<same value you have on Convex>" \
  GROQ_API_KEY="<your Groq API key>"

flyctl deploy
```

First deploy: ~3–5 min (Docker image build pulls ffmpeg + latest
yt-dlp). Subsequent deploys: ~30s.

## After deploying — wire Convex

```bash
cd packages/convex

# For production builds:
npx convex env set --prod MEDIA_EXTRACTOR_URL "https://<your-fly-app>.fly.dev/api/extract-media"
npx convex env set --prod MEDIA_EXTRACTOR_SECRET "<same secret>"

# For preview builds (TestFlight):
# If your TestFlight hits a separate "preview" Convex deployment,
# repeat without --prod. If TestFlight + prod share the same Convex
# deployment, the --prod call above covers both.
```

## Updates

```bash
flyctl deploy
```

Pushes the current code. yt-dlp is re-downloaded at image build time,
so each deploy ships the latest yt-dlp release.

To pin a specific yt-dlp version (e.g. for reproducibility around a
release tag), change the Dockerfile's curl URL from `/latest/` to
`/releases/download/<tag>/yt-dlp`.

## Observability

```bash
flyctl logs              # tail
flyctl logs --no-tail    # one shot
flyctl status            # machines + health
flyctl secrets list      # which secrets are set
flyctl scale show        # vm size + count
```

The server logs every yt-dlp failure with its stderr captured, so
`flyctl logs` is the first place to look when a video doesn't import.

## When this starts hitting "Sign in to confirm you're not a bot"

Two ways to push the failure rate back down, in order of how
invasive they are:

1. **yt-dlp cookies file**: sign in to YouTube on a desktop browser,
   export cookies via a browser extension, mount the file into the
   container, pass `--cookies /etc/yt-dlp/cookies.txt` to every
   `runYtDlp` call. Cookies need to be refreshed roughly monthly.
2. **Residential proxy**: services like Bright Data, Smartproxy, or
   Webshare hand out residential IPs that don't trigger the
   detection. Add `--proxy http://user:pass@host:port` to the spawn
   args. Costs ~$10–50/mo depending on bandwidth.

For TestFlight scale, neither is needed up front.
