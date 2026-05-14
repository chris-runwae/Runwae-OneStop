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

    // Audio path: download the audio file on this machine (where yt-dlp
    // resolved the signed URL — YouTube/TikTok bind these URLs to the
    // requesting IP, so a remote Convex fetch returns 403) and stream
    // the bytes back. The caller can forward them straight to Whisper
    // without ever touching the bound URL.
    const outputPath = join(tmpdir(), `runwae-${randomUUID()}.m4a`);
    try {
      await youtubeDl(url, {
        output: outputPath,
        format: "bestaudio[ext=m4a]/bestaudio",
        noWarnings: true,
        noCheckCertificates: true,
        preferFreeFormats: true,
        addHeader: ["referer:youtube.com", "user-agent:Mozilla/5.0"],
      });
      const bytes = await readFile(outputPath);
      return new NextResponse(bytes, {
        status: 200,
        headers: {
          "content-type": "audio/mp4",
          "content-length": String(bytes.length),
        },
      });
    } finally {
      // Best-effort cleanup. /tmp gets garbage collected anyway.
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
