import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  canonicalize,
  detectPlatform,
  youtubeVideoId,
  type VideoPlatform,
} from "./lib/urlPlatform";

// Hard caps. Inline threshold matches what we can confidently complete
// within a single action's wall-clock budget. Long-cap is a defence
// against very long compilations / livestream archives where Whisper +
// Claude bill would balloon past sane per-user quotas.
const INLINE_MAX_SEC = 240;
const HARD_MAX_SEC = 1200;

type GenerateResult =
  | {
      ok: true;
      mode: "inline";
      tripId: Id<"trips">;
      slug: string;
      remaining: number;
      reused?: boolean;
    }
  | {
      ok: true;
      mode: "background";
      importId: Id<"media_imports">;
      remaining: number;
    }
  | {
      ok: false;
      reason:
        | "not_authenticated"
        | "quota_exhausted"
        | "unsupported_platform"
        | "video_too_long"
        | "transcript_unavailable"
        | "transcript_empty"
        | "extractor_unreachable"
        | "ai_failed";
    };

export const generateTripFromUrl = action({
  args: {
    url: v.string(),
    idempotencyKey: v.optional(v.string()),
    title: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    visibility: v.optional(
      v.union(
        v.literal("private"),
        v.literal("public"),
        v.literal("unlisted")
      )
    ),
    tripLengthDaysOverride: v.optional(v.number()),
    startDateOverride: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<GenerateResult> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return { ok: false, reason: "not_authenticated" };

    const platform = detectPlatform(args.url);
    if (platform === "unknown") {
      return { ok: false, reason: "unsupported_platform" };
    }
    const canonical = canonicalize(args.url);

    // Idempotency: dedupe by (userId, idempotencyKey) so a double-tap of
    // "Create Itinerary" doesn't burn two quota slots.
    if (args.idempotencyKey) {
      const existing = await ctx.runQuery(internal.ai._findExistingByIdempotency, {
        aiIdempotencyKey: args.idempotencyKey,
      });
      if (existing) {
        const q = await ctx.runQuery(internal.ai.getQuotaInternal, {});
        return {
          ok: true,
          mode: "inline",
          tripId: existing.tripId,
          slug: existing.slug,
          remaining: q.remaining,
          reused: true,
        };
      }
    }

    const reserved = await ctx.runMutation(internal.ai._checkAndReserveQuota, {});
    if (!reserved.ok) return { ok: false, reason: "quota_exhausted" };
    const remainingAfter = (
      await ctx.runQuery(internal.ai.getQuotaInternal, {})
    ).remaining;

    // Probe duration + metadata. Three branches:
    //  1. Extractor configured  → full probe (works for both platforms).
    //  2. YouTube, no extractor → oEmbed for title/thumbnail/uploader;
    //     duration unknown so we stay inline-only (no background path).
    //     If captions exist we proceed; otherwise the inline path fails
    //     with transcript_unavailable below.
    //  3. TikTok, no extractor  → can't proceed at all.
    const extractorConfigured =
      !!process.env.MEDIA_EXTRACTOR_URL && !!process.env.MEDIA_EXTRACTOR_SECRET;
    let probe: {
      durationSec: number;
      title: string;
      description: string;
      uploader: string;
      thumbnail: string;
    };
    // True when probe couldn't reach a working extractor and we fell
    // through to oEmbed. Downstream: skip the Whisper retry, because the
    // extractor is the only way to get audio and we already know it's
    // broken.
    let extractorBroken = false;

    if (extractorConfigured) {
      const r = await ctx.runAction(internal.media._callExtractor, {
        url: canonical,
        probeOnly: true,
      });
      if (r.ok) {
        probe = r;
      } else if (platform === "youtube") {
        // Extractor is misconfigured or rate-limited. For YouTube we have
        // a zero-auth oEmbed path that can still succeed if the video has
        // captions. Don't refund the quota yet — the inline captions path
        // below will refund if captions also fail.
        console.warn(
          "[media] extractor probe failed; falling back to YT oEmbed",
        );
        extractorBroken = true;
        const meta = await ctx.runAction(internal.media._fetchYouTubeOembed, {
          url: canonical,
        });
        if (!meta.ok) {
          await ctx.runMutation(internal.ai._refundQuota, {});
          return { ok: false, reason: "extractor_unreachable" };
        }
        probe = {
          durationSec: 0,
          title: meta.title,
          description: "",
          uploader: meta.uploader,
          thumbnail: meta.thumbnail,
        };
      } else {
        // TikTok with broken extractor — no fallback available.
        await ctx.runMutation(internal.ai._refundQuota, {});
        return { ok: false, reason: r.reason };
      }
    } else if (platform === "youtube") {
      const meta = await ctx.runAction(internal.media._fetchYouTubeOembed, {
        url: canonical,
      });
      if (!meta.ok) {
        await ctx.runMutation(internal.ai._refundQuota, {});
        return { ok: false, reason: "extractor_unreachable" };
      }
      probe = {
        durationSec: 0,
        title: meta.title,
        description: "",
        uploader: meta.uploader,
        thumbnail: meta.thumbnail,
      };
    } else {
      // TikTok without extractor — Whisper is the only transcript path and
      // it requires audio from yt-dlp.
      await ctx.runMutation(internal.ai._refundQuota, {});
      return { ok: false, reason: "extractor_unreachable" };
    }

    if (probe.durationSec > HARD_MAX_SEC) {
      await ctx.runMutation(internal.ai._refundQuota, {});
      return { ok: false, reason: "video_too_long" };
    }

    if (probe.durationSec > INLINE_MAX_SEC) {
      // Long video: enqueue background processing and let the home pill
      // pick it up. We've already reserved the quota; if the background
      // job fails we refund it inside _processImport.
      const importId: Id<"media_imports"> = await ctx.runMutation(
        internal.media._createImport,
        {
          url: canonical,
          platform,
          durationSec: probe.durationSec,
          videoTitle: probe.title,
          videoCreator: probe.uploader,
          thumbnailUrl: probe.thumbnail,
          idempotencyKey: args.idempotencyKey,
        }
      );
      await ctx.scheduler.runAfter(0, internal.media._processImport, {
        importId,
        tripLengthDaysOverride: args.tripLengthDaysOverride,
        startDateOverride: args.startDateOverride,
        visibility: args.visibility,
        title: args.title,
        coverImageUrl: args.coverImageUrl,
      });
      return { ok: true, mode: "background", importId, remaining: remainingAfter };
    }

    // Inline path. Transcribe → Claude → materialise → backfill photos.
    // Captions are tried first for YouTube; otherwise we hit the
    // extractor for an audio URL and run it through Groq Whisper.
    let transcriptText: string | null = null;
    if (platform === "youtube") {
      const cap = await ctx.runAction(internal.media._fetchYouTubeCaptions, {
        url: canonical,
      });
      if (cap.ok) transcriptText = cap.text;
    }
    if (!transcriptText) {
      // No captions. Whisper is our only fallback, and it needs the
      // extractor for the audio URL. Skip the retry if we already
      // discovered the extractor was broken during the probe — surface a
      // clean "couldn't read this video" instead of the generic
      // "extractor_unreachable" they'd get from hitting it again.
      if (!extractorConfigured || extractorBroken) {
        await ctx.runMutation(internal.ai._refundQuota, {});
        return { ok: false, reason: "transcript_unavailable" };
      }
      const audio = await ctx.runAction(
        internal.media._fetchExtractorAudio,
        { url: canonical },
      );
      if (!audio.ok) {
        await ctx.runMutation(internal.ai._refundQuota, {});
        return { ok: false, reason: "extractor_unreachable" };
      }
      const whisper = await ctx.runAction(internal.media._callGroqWhisper, {
        audioBytes: audio.audioBytes,
        contentType: audio.contentType,
      });
      if (!whisper.ok) {
        await ctx.runMutation(internal.ai._refundQuota, {});
        return { ok: false, reason: "transcript_empty" };
      }
      transcriptText = whisper.text;
    }

    const plan = await ctx.runAction(internal.ai._callClaudeForUrlItinerary, {
      transcript: transcriptText,
      platform,
      videoTitle: probe.title,
      videoDescription: probe.description,
      videoCreator: probe.uploader,
      todayIso: new Date().toISOString().slice(0, 10),
      tripLengthDaysOverride: args.tripLengthDaysOverride,
    });
    if (!plan) {
      await ctx.runMutation(internal.ai._refundQuota, {});
      return { ok: false, reason: "ai_failed" };
    }

    const { startDate, endDate } = computeDates({
      todayIso: new Date().toISOString().slice(0, 10),
      startDateOverride: args.startDateOverride,
      tripLengthDays: args.tripLengthDaysOverride ?? plan.suggestedTripLengthDays,
      planDays: plan.days,
    });

    await backfillItemImages(ctx, plan.days, plan.destinationLabel);

    const materialized: { tripId: Id<"trips">; slug: string } =
      await ctx.runMutation(internal.ai._materializeFreeFormTrip, {
        aiIdempotencyKey: args.idempotencyKey,
        title: args.title ?? probe.title ?? `Trip to ${plan.destinationLabel}`,
        description: probe.description?.slice(0, 500),
        destinationLabel: plan.destinationLabel,
        destinationCoords: plan.destinationCoords,
        coverImageUrl: args.coverImageUrl ?? probe.thumbnail,
        visibility:
          args.visibility === "public" ? "public" : "private",
        startDate,
        endDate,
        groupSize: "small",
        sourceUrl: canonical,
        sourceType: platform,
        sourceTitle: probe.title,
        sourceCreator: probe.uploader,
        days: plan.days,
      });

    return {
      ok: true,
      mode: "inline",
      tripId: materialized.tripId,
      slug: materialized.slug,
      remaining: remainingAfter,
    };
  },
});

// ── Internal: extractor wrapper ─────────────────────────────────────────

// Probe-mode extractor — returns metadata JSON. Audio bytes go through
// the separate `_fetchExtractorAudio` action below so the two contracts
// (JSON vs binary) don't share a type signature.
type ExtractorResult =
  | {
      ok: true;
      durationSec: number;
      title: string;
      description: string;
      uploader: string;
      thumbnail: string;
    }
  | { ok: false; reason: "extractor_unreachable" };

export const _callExtractor = internalAction({
  args: {
    url: v.string(),
    probeOnly: v.boolean(),
  },
  handler: async (_ctx, args): Promise<ExtractorResult> => {
    const endpoint = process.env.MEDIA_EXTRACTOR_URL;
    const secret = process.env.MEDIA_EXTRACTOR_SECRET;
    if (!endpoint || !secret) {
      console.warn("[media] MEDIA_EXTRACTOR_URL/SECRET not set");
      return { ok: false, reason: "extractor_unreachable" };
    }
    // Probe-only is the supported shape for this action; audio-mode is
    // served by `_fetchExtractorAudio`. The probeOnly arg is kept for
    // backward-compat with the existing call sites.
    const url = `${endpoint}?probe=1`;
    void args.probeOnly;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ url: args.url }),
      });
      if (!res.ok) {
        console.warn(`[media] extractor returned ${res.status}`);
        return { ok: false, reason: "extractor_unreachable" };
      }
      const data = (await res.json()) as {
        durationSec?: number;
        title?: string;
        description?: string;
        uploader?: string;
        thumbnail?: string;
      };
      return {
        ok: true,
        durationSec: Math.max(0, Math.round(data.durationSec ?? 0)),
        title: data.title ?? "",
        description: data.description ?? "",
        uploader: data.uploader ?? "",
        thumbnail: data.thumbnail ?? "",
      };
    } catch (err) {
      console.warn("[media] extractor fetch failed", err);
      return { ok: false, reason: "extractor_unreachable" };
    }
  },
});

// Downloads the audio file via the extractor and returns the bytes
// directly. We can't return a URL because YouTube/TikTok bind their
// signed audio URLs to the IP that requested them — yt-dlp on the
// extractor host = same IP = works; Convex cloud fetch = different IP =
// 403. By having the extractor download and stream the bytes back, the
// IP-bound fetch happens on the right machine.
export const _fetchExtractorAudio = internalAction({
  args: { url: v.string() },
  handler: async (
    _ctx,
    args,
  ): Promise<
    | { ok: true; audioBytes: ArrayBuffer; contentType: string }
    | { ok: false; reason: "extractor_unreachable" }
  > => {
    const endpoint = process.env.MEDIA_EXTRACTOR_URL;
    const secret = process.env.MEDIA_EXTRACTOR_SECRET;
    if (!endpoint || !secret) {
      console.warn("[media] MEDIA_EXTRACTOR_URL/SECRET not set");
      return { ok: false, reason: "extractor_unreachable" };
    }
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ url: args.url }),
      });
      if (!res.ok) {
        console.warn(`[media] extractor audio returned ${res.status}`);
        return { ok: false, reason: "extractor_unreachable" };
      }
      const contentType = res.headers.get("content-type") ?? "audio/mp4";
      const audioBytes = await res.arrayBuffer();
      return { ok: true, audioBytes, contentType };
    } catch (err) {
      console.warn("[media] extractor audio fetch failed", err);
      return { ok: false, reason: "extractor_unreachable" };
    }
  },
});

// ── Internal: YouTube oEmbed (zero-auth metadata for the no-extractor path)

export const _fetchYouTubeOembed = internalAction({
  args: { url: v.string() },
  handler: async (
    _ctx,
    { url }
  ): Promise<
    | { ok: true; title: string; uploader: string; thumbnail: string }
    | { ok: false }
  > => {
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`
      );
      if (!res.ok) return { ok: false };
      const data = (await res.json()) as {
        title?: string;
        author_name?: string;
        thumbnail_url?: string;
      };
      return {
        ok: true,
        title: data.title ?? "",
        uploader: data.author_name ?? "",
        thumbnail: data.thumbnail_url ?? "",
      };
    } catch (err) {
      console.warn("[media] yt oembed failed", err);
      return { ok: false };
    }
  },
});

// ── Internal: YouTube timedtext (caption-first path) ────────────────────

export const _fetchYouTubeCaptions = internalAction({
  args: { url: v.string() },
  handler: async (_ctx, { url }): Promise<{ ok: true; text: string } | { ok: false }> => {
    const videoId = youtubeVideoId(url);
    if (!videoId) return { ok: false };
    try {
      const res = await fetch(
        `https://video.google.com/timedtext?lang=en&v=${encodeURIComponent(videoId)}`
      );
      if (!res.ok || res.status === 204) return { ok: false };
      const xml = await res.text();
      if (!xml.trim() || xml.indexOf("<transcript") === -1) return { ok: false };
      // Strip XML to plain text: extract <text …>…</text> bodies and unescape
      // the few entities YouTube uses. Cheap enough at the lengths we see
      // (typical 10-min vlog ≈ 20 KB).
      const text = xml
        .match(/<text[^>]*>([\s\S]*?)<\/text>/g)
        ?.map((segment) =>
          segment
            .replace(/<[^>]+>/g, "")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .trim()
        )
        .filter(Boolean)
        .join(" ") ?? "";
      if (text.length < 30) return { ok: false };
      return { ok: true, text };
    } catch (err) {
      console.warn("[media] yt timedtext failed", err);
      return { ok: false };
    }
  },
});

// ── Internal: Groq Whisper fallback ─────────────────────────────────────

export const _callGroqWhisper = internalAction({
  args: {
    audioBytes: v.bytes(),
    contentType: v.optional(v.string()),
  },
  handler: async (
    _ctx,
    { audioBytes, contentType: ctIn }
  ): Promise<{ ok: true; text: string } | { ok: false }> => {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      console.warn("[media] GROQ_API_KEY not set");
      return { ok: false };
    }
    try {
      const contentType = ctIn ?? "audio/mp4";
      // Pick a filename suffix Groq accepts. The actual codec doesn't
      // matter — Whisper sniffs the bytes — but a sensible extension
      // avoids edge cases.
      const ext =
        contentType.includes("webm")
          ? "webm"
          : contentType.includes("ogg")
            ? "ogg"
            : contentType.includes("mpeg")
              ? "mp3"
              : contentType.startsWith("video/mp4")
                ? "mp4"
                : "m4a";

      const form = new FormData();
      form.append("model", "whisper-large-v3-turbo");
      form.append(
        "file",
        new Blob([audioBytes], { type: contentType }),
        `audio.${ext}`
      );
      form.append("response_format", "text");

      const res = await fetch(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        {
          method: "POST",
          headers: { authorization: `Bearer ${groqKey}` },
          body: form,
        }
      );
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        console.warn(
          "[media] groq whisper returned",
          res.status,
          detail.slice(0, 300)
        );
        return { ok: false };
      }
      const text = (await res.text()).trim();
      if (text.length < 30) return { ok: false };
      return { ok: true, text };
    } catch (err) {
      console.warn("[media] groq whisper fetch failed", err);
      return { ok: false };
    }
  },
});

// ── Internal: create + update media_imports rows ────────────────────────

export const _createImport = internalMutation({
  args: {
    url: v.string(),
    platform: v.union(v.literal("youtube"), v.literal("tiktok")),
    durationSec: v.optional(v.number()),
    videoTitle: v.optional(v.string()),
    videoCreator: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    idempotencyKey: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"media_imports">> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const now = Date.now();
    return await ctx.db.insert("media_imports", {
      userId,
      url: args.url,
      platform: args.platform,
      status: "queued",
      durationSec: args.durationSec,
      videoTitle: args.videoTitle,
      videoCreator: args.videoCreator,
      thumbnailUrl: args.thumbnailUrl,
      idempotencyKey: args.idempotencyKey,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const _setImportStatus = internalMutation({
  args: {
    importId: v.id("media_imports"),
    status: v.union(
      v.literal("queued"),
      v.literal("extracting"),
      v.literal("transcribing"),
      v.literal("planning"),
      v.literal("materializing"),
      v.literal("done"),
      v.literal("failed")
    ),
    transcript: v.optional(v.string()),
    tripId: v.optional(v.id("trips")),
    slug: v.optional(v.string()),
    errorReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {
      status: args.status,
      updatedAt: Date.now(),
    };
    if (args.transcript !== undefined) patch.transcript = args.transcript;
    if (args.tripId !== undefined) patch.tripId = args.tripId;
    if (args.slug !== undefined) patch.slug = args.slug;
    if (args.errorReason !== undefined) patch.errorReason = args.errorReason;
    await ctx.db.patch(args.importId, patch);
  },
});

// ── Internal: background processor ──────────────────────────────────────

export const _processImport = internalAction({
  args: {
    importId: v.id("media_imports"),
    tripLengthDaysOverride: v.optional(v.number()),
    startDateOverride: v.optional(v.string()),
    visibility: v.optional(
      v.union(v.literal("private"), v.literal("public"), v.literal("unlisted"))
    ),
    title: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<void> => {
    const row = await ctx.runQuery(internal.media._getImport, {
      importId: args.importId,
    });
    if (!row) return;

    await ctx.runMutation(internal.media._setImportStatus, {
      importId: args.importId,
      status: "extracting",
    });

    // Caption-first for YouTube; otherwise we need the audio URL.
    let transcriptText: string | null = null;
    if (row.platform === "youtube") {
      const cap = await ctx.runAction(internal.media._fetchYouTubeCaptions, {
        url: row.url,
      });
      if (cap.ok) transcriptText = cap.text;
    }

    if (!transcriptText) {
      const audio = await ctx.runAction(
        internal.media._fetchExtractorAudio,
        { url: row.url },
      );
      if (!audio.ok) {
        await ctx.runMutation(internal.ai._refundQuota, { userId: row.userId });
        await ctx.runMutation(internal.media._setImportStatus, {
          importId: args.importId,
          status: "failed",
          errorReason: "extractor_unreachable",
        });
        return;
      }
      await ctx.runMutation(internal.media._setImportStatus, {
        importId: args.importId,
        status: "transcribing",
      });
      const whisper = await ctx.runAction(internal.media._callGroqWhisper, {
        audioBytes: audio.audioBytes,
        contentType: audio.contentType,
      });
      if (!whisper.ok) {
        await ctx.runMutation(internal.ai._refundQuota, { userId: row.userId });
        await ctx.runMutation(internal.media._setImportStatus, {
          importId: args.importId,
          status: "failed",
          errorReason: "transcript_unavailable",
        });
        return;
      }
      transcriptText = whisper.text;
    }

    await ctx.runMutation(internal.media._setImportStatus, {
      importId: args.importId,
      status: "planning",
      transcript: transcriptText,
    });

    const plan = await ctx.runAction(internal.ai._callClaudeForUrlItinerary, {
      transcript: transcriptText,
      platform: row.platform,
      videoTitle: row.videoTitle,
      videoCreator: row.videoCreator,
      todayIso: new Date().toISOString().slice(0, 10),
      tripLengthDaysOverride: args.tripLengthDaysOverride,
    });
    if (!plan) {
      await ctx.runMutation(internal.ai._refundQuota, { userId: row.userId });
      await ctx.runMutation(internal.media._setImportStatus, {
        importId: args.importId,
        status: "failed",
        errorReason: "ai_failed",
      });
      return;
    }

    await ctx.runMutation(internal.media._setImportStatus, {
      importId: args.importId,
      status: "materializing",
    });

    const { startDate, endDate } = computeDates({
      todayIso: new Date().toISOString().slice(0, 10),
      startDateOverride: args.startDateOverride,
      tripLengthDays: args.tripLengthDaysOverride ?? plan.suggestedTripLengthDays,
      planDays: plan.days,
    });

    await backfillItemImages(ctx, plan.days, plan.destinationLabel);

    const materialized: { tripId: Id<"trips">; slug: string } =
      await ctx.runMutation(internal.ai._materializeFreeFormTrip, {
        aiIdempotencyKey: row.idempotencyKey,
        title:
          args.title ?? row.videoTitle ?? `Trip to ${plan.destinationLabel}`,
        destinationLabel: plan.destinationLabel,
        destinationCoords: plan.destinationCoords,
        coverImageUrl: args.coverImageUrl ?? row.thumbnailUrl,
        visibility:
          args.visibility === "public" ? "public" : "private",
        startDate,
        endDate,
        groupSize: "small",
        sourceUrl: row.url,
        sourceType: row.platform,
        sourceTitle: row.videoTitle,
        sourceCreator: row.videoCreator,
        // Scheduler-invoked path: pass userId explicitly because
        // getAuthUserId returns null here.
        creatorId: row.userId,
        days: plan.days,
      });

    await ctx.runMutation(internal.media._setImportStatus, {
      importId: args.importId,
      status: "done",
      tripId: materialized.tripId,
      slug: materialized.slug,
    });
  },
});

// ── Public: read your active imports for the home-screen pill ──────────

export const myActiveImports = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const rows = await ctx.db
      .query("media_imports")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
    // Show rows that are still in flight OR succeeded within the last 5m
    // so the pill stays up long enough for the user to tap into the new
    // trip. After that, it disappears on its own.
    const FRESH_MS = 5 * 60 * 1000;
    const now = Date.now();
    return rows.filter(
      (r) =>
        r.status !== "failed" &&
        (r.status !== "done" || now - r.updatedAt < FRESH_MS)
    );
  },
});

export const _getImport = internalQuery({
  args: { importId: v.id("media_imports") },
  handler: async (ctx, { importId }) => {
    return await ctx.db.get(importId);
  },
});

// ── Helpers ─────────────────────────────────────────────────────────────

// Mutates `days` in place, assigning an Unsplash image URL to every
// item. Differences from the free-form flow:
//   - Always overrides any imageUrl Claude produced. The URL prompt
//     never asks for image URLs, but Claude occasionally hallucinates
//     ones that 404 — safer to always pick the photo ourselves.
//   - Fallback chain per item: locationName → title → "<type-keyword>
//     <destination>" → destinationLabel. Specific venue names often
//     return zero Unsplash hits, so the broader keywords catch them.
//   - Queries are still deduped across items so a Barcelona trip with
//     six restaurants makes ≤ 6 + 1 fallback Unsplash calls, not 12.
const TYPE_KEYWORD: Record<string, string> = {
  restaurant: "restaurant",
  hotel: "hotel",
  tour: "tourism",
  activity: "travel",
  event: "concert",
  flight: "airplane",
  transport: "transit",
  car_rental: "road trip",
  other: "travel",
};

async function backfillItemImages(
  ctx: { runAction: (ref: any, args: any) => Promise<any> },
  days: Array<{
    items: Array<{
      imageUrl?: string;
      locationName?: string;
      title: string;
      type: string;
    }>;
  }>,
  destinationLabel: string,
): Promise<void> {
  const queries = new Set<string>();
  const chains: Array<{
    item: { imageUrl?: string };
    chain: string[];
  }> = [];

  for (const d of days) {
    for (const it of d.items) {
      const typeKw = TYPE_KEYWORD[it.type] ?? "travel";
      const chain = [
        it.locationName,
        it.title,
        destinationLabel ? `${typeKw} ${destinationLabel}` : null,
        destinationLabel,
        typeKw,
      ]
        .filter((q): q is string => typeof q === "string" && q.trim().length > 0)
        .map((q) => q.trim());
      chains.push({ item: it, chain });
      for (const q of chain) queries.add(q);
    }
  }

  if (queries.size === 0) return;

  const photoMap: Record<string, string> = await ctx.runAction(
    internal.ai._unsplashBackfill,
    { queries: Array.from(queries) },
  );

  for (const { item, chain } of chains) {
    for (const q of chain) {
      if (photoMap[q]) {
        item.imageUrl = photoMap[q];
        break;
      }
    }
  }
}

function computeDates(args: {
  todayIso: string;
  startDateOverride?: string;
  tripLengthDays: number;
  planDays: Array<{ date?: string }>;
}): { startDate: string; endDate: string } {
  const length = Math.max(
    args.planDays.length,
    Math.max(2, Math.min(7, args.tripLengthDays))
  );
  const start = args.startDateOverride
    ? new Date(`${args.startDateOverride}T00:00:00Z`)
    : firstMondayAtLeast30dOut(args.todayIso);
  const end = new Date(start.getTime() + (length - 1) * 86_400_000);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function firstMondayAtLeast30dOut(todayIso: string): Date {
  const base = new Date(`${todayIso}T00:00:00Z`);
  base.setUTCDate(base.getUTCDate() + 30);
  while (base.getUTCDay() !== 1) {
    base.setUTCDate(base.getUTCDate() + 1);
  }
  return base;
}

