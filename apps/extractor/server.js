// Standalone yt-dlp + Groq Whisper service. Sits behind the
// MEDIA_EXTRACTOR_URL Convex env var. Contract mirrors the previous
// Next.js route at apps/web/app/api/extract-media/route.ts — same
// bearer auth, same request body, same response shapes — so Convex
// (`_callExtractor`, `_fetchExtractorTranscript`) can swap hosts
// without any code change.
//
// Why this exists separately from apps/web: yt-dlp on Vercel/AWS
// gets aggressively rate-limited by YouTube and TikTok (cloud-IP
// detection). Running on Fly.io's residential-adjacent IPs keeps
// success rates high enough for TestFlight scale. When this starts
// hitting "Sign in to confirm you're not a bot" frequently, the
// next step is a yt-dlp cookies file or a residential proxy — both
// drop in to the spawn call below.

import express from "express";
import { Blob } from "node:buffer";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFile, stat, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const app = express();
app.use(express.json({ limit: "1mb" }));

const SECRET = process.env.MEDIA_EXTRACTOR_SECRET;
const GROQ_KEY = process.env.GROQ_API_KEY;
const YT_DLP = process.env.YT_DLP_BIN || "/usr/local/bin/yt-dlp";

if (!SECRET) {
  console.warn(
    "[extractor] MEDIA_EXTRACTOR_SECRET not set — every request will 401",
  );
}
if (!GROQ_KEY) {
  console.warn(
    "[extractor] GROQ_API_KEY not set — transcript endpoint will 503",
  );
}

function isAuthorized(req) {
  if (!SECRET) return false;
  return req.headers.authorization === `Bearer ${SECRET}`;
}

// Spawn yt-dlp, capture stdout/stderr, resolve with both. Failures
// reject with `{ code, stdout, stderr }` so the caller can surface
// the real reason (rate-limit, format mismatch, etc.) instead of a
// generic 502.
function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(YT_DLP, args);
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (chunk) => (stdout += chunk.toString()));
    proc.stderr.on("data", (chunk) => (stderr += chunk.toString()));
    proc.on("error", (err) => reject({ code: "spawn_failed", message: err.message }));
    proc.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject({ code, stdout, stderr });
    });
  });
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    ytDlpBin: YT_DLP,
    hasSecret: !!SECRET,
    hasGroq: !!GROQ_KEY,
  });
});

app.post("/api/extract-media", async (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const url = typeof req.body?.url === "string" ? req.body.url.trim() : "";
  if (!url) {
    return res.status(400).json({ error: "missing_url" });
  }

  const probeOnly = req.query.probe === "1";

  try {
    // ── Probe mode ────────────────────────────────────────────────
    // Metadata-only via --dump-single-json --skip-download. Cheap
    // and fast (no audio bytes downloaded). Convex calls this first
    // to get duration/title/thumbnail before deciding inline vs
    // background dispatch.
    if (probeOnly) {
      const { stdout } = await runYtDlp([
        "--dump-single-json",
        "--skip-download",
        "--no-warnings",
        "--no-check-certificates",
        "--prefer-free-formats",
        "--add-header",
        "referer:youtube.com",
        "--add-header",
        "user-agent:Mozilla/5.0",
        url,
      ]);
      const info = JSON.parse(stdout);
      return res.json({
        durationSec: typeof info.duration === "number" ? info.duration : 0,
        title: info.title ?? "",
        description: info.description ?? "",
        uploader: info.uploader ?? "",
        thumbnail: info.thumbnail ?? "",
      });
    }

    // ── Transcript mode ───────────────────────────────────────────
    // Download audio + forward to Groq Whisper. Audio bytes never
    // leave this host — they go straight from /tmp to Groq's
    // /audio/transcriptions endpoint. Only the transcript text (a
    // few KB) flows back to Convex.
    if (!GROQ_KEY) {
      return res.status(503).json({ error: "groq_not_configured" });
    }
    const outputPath = join(tmpdir(), `runwae-${randomUUID()}.m4a`);
    try {
      await runYtDlp([
        "-o",
        outputPath,
        // YouTube exposes audio-only streams (bestaudio); TikTok
        // does not, so fall back to the best combined video.
        // Whisper accepts mp4 containers and just transcodes the
        // audio track.
        "-f",
        "bestaudio[ext=m4a]/bestaudio/best",
        "--no-warnings",
        "--no-check-certificates",
        "--prefer-free-formats",
        "--add-header",
        "referer:youtube.com",
        "--add-header",
        "user-agent:Mozilla/5.0",
        url,
      ]);

      const fileStat = await stat(outputPath).catch(() => null);
      if (!fileStat) {
        return res.status(502).json({ error: "no_output_file" });
      }

      const bytes = await readFile(outputPath);

      const form = new FormData();
      form.append("model", "whisper-large-v3-turbo");
      form.append(
        "file",
        new Blob([bytes], { type: "audio/mp4" }),
        // Filename extension hints Groq's codec sniffer. Use .mp4
        // since the combined-video fallback gives us mp4 and
        // audio-only m4a is also handled under the mp4 family.
        "audio.mp4",
      );
      form.append("response_format", "text");

      const whisperRes = await fetch(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        {
          method: "POST",
          headers: { authorization: `Bearer ${GROQ_KEY}` },
          body: form,
        },
      );
      if (!whisperRes.ok) {
        const detail = await whisperRes.text().catch(() => "");
        console.error("[extractor] groq whisper failed", {
          status: whisperRes.status,
          detail: detail.slice(0, 400),
        });
        return res.status(502).json({
          error: "transcription_failed",
          status: whisperRes.status,
          detail: detail.slice(0, 400),
        });
      }
      const transcript = (await whisperRes.text()).trim();
      if (transcript.length < 30) {
        return res.status(502).json({ error: "transcript_empty" });
      }
      return res.json({ transcript });
    } finally {
      await unlink(outputPath).catch(() => {});
    }
  } catch (err) {
    const detail =
      err?.stderr?.slice(0, 800) ||
      err?.message ||
      (typeof err === "string" ? err : "unknown");
    console.error("[extractor] yt-dlp failed", {
      code: err?.code,
      stderr: err?.stderr?.slice(0, 2000),
      stdout: err?.stdout?.slice(0, 1000),
    });
    return res.status(502).json({
      error: "extractor_failed",
      detail: String(detail).slice(0, 800),
    });
  }
});

const port = Number(process.env.PORT) || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log(`[extractor] listening on :${port} (yt-dlp=${YT_DLP})`);
});
