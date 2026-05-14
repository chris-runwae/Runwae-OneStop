import { NextRequest, NextResponse } from "next/server";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { readFile, unlink } from "node:fs/promises";

// yt-dlp wrapper. The npm package bundles a Python-zipapp version of
// yt-dlp that requires python3 on PATH — fragile in serverless environments
// and on macOS where python3 isn't always available to Node-spawned
// processes. We prefer a real native binary when YT_DLP_BIN is set
// (e.g. `brew install yt-dlp` → /opt/homebrew/bin/yt-dlp) and fall back
// to the bundled zipapp otherwise.
import youtubeDlDefault, { create as createYoutubeDl } from "youtube-dl-exec";

const youtubeDl = process.env.YT_DLP_BIN
  ? createYoutubeDl(process.env.YT_DLP_BIN)
  : youtubeDlDefault;

export const runtime = "nodejs";
export const maxDuration = 60;

const SECRET = process.env.MEDIA_EXTRACTOR_SECRET;

type ProbeResult = {
  durationSec: number;
  title: string;
  description: string;
  uploader: string;
  thumbnail: string;
};

function isAuthorized(req: NextRequest): boolean {
  if (!SECRET) return false;
  const header = req.headers.get("authorization") ?? "";
  return header === `Bearer ${SECRET}`;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401 }
    );
  }

  let body: { url?: string };
  try {
    body = (await req.json()) as { url?: string };
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const url = body.url?.trim();
  if (!url) {
    return NextResponse.json({ error: "missing_url" }, { status: 400 });
  }

  const probeOnly = req.nextUrl.searchParams.get("probe") === "1";

  try {
    if (probeOnly) {
      const info = (await youtubeDl(url, {
        dumpSingleJson: true,
        noWarnings: true,
        skipDownload: true,
        noCheckCertificates: true,
        preferFreeFormats: true,
        addHeader: ["referer:youtube.com", "user-agent:Mozilla/5.0"],
      })) as {
        duration?: number;
        title?: string;
        description?: string;
        uploader?: string;
        thumbnail?: string;
      };

      const probe: ProbeResult = {
        durationSec: typeof info.duration === "number" ? info.duration : 0,
        title: info.title ?? "",
        description: info.description ?? "",
        uploader: info.uploader ?? "",
        thumbnail: info.thumbnail ?? "",
      };
      return NextResponse.json(probe);
    }

    // Transcript path: download the audio on this machine (where yt-dlp
    // resolved the IP-bound CDN URL), forward bytes straight to Groq
    // Whisper, return the transcript as JSON. The audio bytes never
    // cross the Convex boundary — important because TikTok lacks
    // audio-only formats and the combined video file can exceed
    // Convex's 16 MiB action-return limit (a 21 MiB TikTok mp4 fails
    // there). Groq accepts files up to 25 MiB, well above what yt-dlp
    // returns for inline-eligible (<4 min) clips.
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json(
        { error: "groq_not_configured" },
        { status: 503 },
      );
    }

    const outputPath = join(tmpdir(), `runwae-${randomUUID()}.m4a`);
    try {
      await youtubeDl(url, {
        output: outputPath,
        format: "bestaudio[ext=m4a]/bestaudio/best",
        noWarnings: true,
        noCheckCertificates: true,
        preferFreeFormats: true,
        addHeader: ["referer:youtube.com", "user-agent:Mozilla/5.0"],
      });
      const bytes = await readFile(outputPath);

      const form = new FormData();
      form.append("model", "whisper-large-v3-turbo");
      form.append(
        "file",
        new Blob([bytes], { type: "audio/mp4" }),
        // Filename extension just hints to Whisper's codec sniffer. Use
        // .mp4 since combined-video fallback gives us mp4 containers
        // and audio-only m4a is also handled under the mp4 family.
        "audio.mp4",
      );
      form.append("response_format", "text");

      const whisperRes = await fetch(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        {
          method: "POST",
          headers: { authorization: `Bearer ${groqKey}` },
          body: form,
        },
      );
      if (!whisperRes.ok) {
        const detail = await whisperRes.text().catch(() => "");
        console.error("[extract-media] groq whisper failed", {
          status: whisperRes.status,
          detail: detail.slice(0, 400),
        });
        return NextResponse.json(
          {
            error: "transcription_failed",
            status: whisperRes.status,
            detail: detail.slice(0, 400),
          },
          { status: 502 },
        );
      }
      const transcript = (await whisperRes.text()).trim();
      if (transcript.length < 30) {
        return NextResponse.json(
          { error: "transcript_empty" },
          { status: 502 },
        );
      }
      return NextResponse.json({ transcript });
    } finally {
      await unlink(outputPath).catch(() => {});
    }
  } catch (err) {
    // youtube-dl-exec throws an object with `stderr` / `stdout` on
    // failure — not a plain Error. Pull whatever shape it actually has
    // so we can see WHY yt-dlp didn't run (binary missing, rate-limit,
    // 403, etc.) instead of returning a blank `detail`.
    const e = err as {
      message?: string;
      stderr?: string;
      stdout?: string;
      shortMessage?: string;
      code?: string | number;
    } | null;
    const detail =
      e?.stderr?.slice(0, 800) ||
      e?.message ||
      e?.shortMessage ||
      e?.stdout?.slice(0, 400) ||
      (typeof err === "string" ? err : "unknown");
    console.error("[extract-media] yt-dlp failed", {
      code: e?.code,
      message: e?.message,
      shortMessage: e?.shortMessage,
      stderr: e?.stderr?.slice(0, 2000),
      stdout: e?.stdout?.slice(0, 1000),
    });
    return NextResponse.json(
      { error: "extractor_failed", detail: String(detail).slice(0, 800) },
      { status: 502 }
    );
  }
}
