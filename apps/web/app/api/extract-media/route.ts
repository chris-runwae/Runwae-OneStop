import { NextRequest, NextResponse } from "next/server";

// yt-dlp wrapper. Bundles a static yt-dlp binary and exposes a typed CLI
// surface. We use the `exec` helper rather than the JSON-emit shortcut so
// failures surface with stderr we can grep in logs.
import youtubeDl from "youtube-dl-exec";

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

type ExtractResult = ProbeResult & {
  audioUrl: string;
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
    // --skip-download keeps yt-dlp from streaming bytes — we only need
    // metadata for both probe and audio-url responses. The audio URL
    // itself is a short-lived signed CDN URL that Whisper can fetch
    // directly, so we never proxy the audio through our own infra.
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
      formats?: Array<{
        url?: string;
        acodec?: string;
        vcodec?: string;
        abr?: number;
      }>;
      url?: string;
    };

    const probe: ProbeResult = {
      durationSec: typeof info.duration === "number" ? info.duration : 0,
      title: info.title ?? "",
      description: info.description ?? "",
      uploader: info.uploader ?? "",
      thumbnail: info.thumbnail ?? "",
    };

    if (probeOnly) {
      return NextResponse.json(probe);
    }

    // Pick the best audio-only format. `bestaudio` is what yt-dlp would
    // pick with `-f bestaudio`, but we have to do the selection ourselves
    // here because we asked for dumpSingleJson (which returns the full
    // formats list).
    const audioFormat = (info.formats ?? [])
      .filter(
        (f) =>
          typeof f.url === "string" &&
          f.acodec &&
          f.acodec !== "none" &&
          (!f.vcodec || f.vcodec === "none")
      )
      .sort((a, b) => (b.abr ?? 0) - (a.abr ?? 0))[0];

    const audioUrl = audioFormat?.url ?? info.url;
    if (!audioUrl) {
      return NextResponse.json(
        { error: "no_audio_format" },
        { status: 502 }
      );
    }

    const result: ExtractResult = { ...probe, audioUrl };
    return NextResponse.json(result);
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
