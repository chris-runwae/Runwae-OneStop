# Two-stage build keeps the final image lean. Build stage installs npm
# deps with native build tools available; runtime stage carries only
# yt-dlp, ffmpeg, python3 (yt-dlp dependency on some platforms), Node,
# and the resolved node_modules.

# ── Stage 1: install npm deps ───────────────────────────────────────
FROM node:20-slim AS deps

WORKDIR /app
COPY package.json ./
# Use the lockfile-less install — apps/extractor has no transitive
# binary deps, so npm's default resolution is deterministic enough
# given a pinned version range. (Fly's build cache invalidates on
# package.json changes, not lockfile changes.)
RUN npm install --omit=dev --no-package-lock --no-audit --no-fund


# ── Stage 2: runtime ────────────────────────────────────────────────
FROM node:20-slim AS runtime

# yt-dlp (downloaded fresh — Debian's apt package is months behind),
# ffmpeg (for audio extraction post-processing), python3 (yt-dlp's
# fallback runtime; the standalone binary also works without it but
# it's a small safety net), ca-certificates (HTTPS to YouTube/Groq).
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates \
      curl \
      ffmpeg \
      python3 \
  && curl -fsSL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
       -o /usr/local/bin/yt-dlp \
  && chmod +x /usr/local/bin/yt-dlp \
  && /usr/local/bin/yt-dlp --version \
  && apt-get purge -y curl \
  && apt-get autoremove -y \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json server.js ./

ENV NODE_ENV=production \
    PORT=8080 \
    YT_DLP_BIN=/usr/local/bin/yt-dlp

EXPOSE 8080

# Run as the unprivileged `node` user shipped by node:20-slim.
USER node

CMD ["node", "server.js"]
