import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireAdmin } from "../lib/admin";
import type { Id } from "../_generated/dataModel";

const HOUR_MS = 3_600_000;

type Bucket =
  | "math_mismatch"
  | "split_pct_out_of_range"
  | "host_share_exceeds_total"
  | "runwae_share_100x"
  | "negative_amount";

type Finding = {
  bucket: Bucket;
  commissionId: Id<"commissions">;
  bookingId: Id<"bookings">;
  totalCommission: number;
  hostShare: number;
  runwaeShare: number;
  splitPct: number;
  currency: string;
  status: string;
  createdAt: number;
  detail: string;
};

/**
 * Sweep the `commissions` table for rows that look wrong. Read-only; the
 * caller decides whether to backfill. Buckets:
 *
 *  - math_mismatch       — hostShare + runwaeShare !== totalCommission
 *  - split_pct_out_of_range — splitPct < 0 or > 100 (basis-points contamination)
 *  - host_share_exceeds_total — hostShare > totalCommission (impossible)
 *  - runwae_share_100x   — runwaeShare > totalCommission * 100 (the 100x case)
 *  - negative_amount     — any of totalCommission / hostShare / runwaeShare < 0
 *
 * Run from CLI:
 *   npx convex run admin:auditCommissions:scan '{"hours":720}'
 */
export const scan = query({
  args: {
    hours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const since =
      args.hours !== undefined ? Date.now() - args.hours * HOUR_MS : 0;

    // Pull a hard-capped slice — 5000 rows is well under Convex's 16k
    // query-document limit and easily covers months of activity at
    // current volume.
    const rows = await ctx.db.query("commissions").take(5_000);
    const inWindow = rows.filter((r) => r.createdAt >= since);

    const findings: Finding[] = [];

    for (const r of inWindow) {
      const base = {
        commissionId: r._id,
        bookingId: r.bookingId,
        totalCommission: r.totalCommission,
        hostShare: r.hostShare,
        runwaeShare: r.runwaeShare,
        splitPct: r.splitPct,
        currency: r.currency,
        status: r.status,
        createdAt: r.createdAt,
      };

      if (
        r.totalCommission < 0 ||
        r.hostShare < 0 ||
        r.runwaeShare < 0
      ) {
        findings.push({
          ...base,
          bucket: "negative_amount",
          detail: `negative amounts: total=${r.totalCommission} host=${r.hostShare} runwae=${r.runwaeShare}`,
        });
        continue;
      }

      if (r.hostShare + r.runwaeShare !== r.totalCommission) {
        findings.push({
          ...base,
          bucket: "math_mismatch",
          detail: `host+runwae=${r.hostShare + r.runwaeShare} !== total=${r.totalCommission}`,
        });
      }

      if (r.splitPct < 0 || r.splitPct > 100) {
        findings.push({
          ...base,
          bucket: "split_pct_out_of_range",
          detail: `splitPct=${r.splitPct}`,
        });
      }

      if (r.hostShare > r.totalCommission) {
        findings.push({
          ...base,
          bucket: "host_share_exceeds_total",
          detail: `host=${r.hostShare} > total=${r.totalCommission}`,
        });
      }

      if (r.runwaeShare > r.totalCommission * 100) {
        findings.push({
          ...base,
          bucket: "runwae_share_100x",
          detail: `runwae=${r.runwaeShare} > total*100=${r.totalCommission * 100}`,
        });
      }
    }

    // Most recent first.
    findings.sort((a, b) => b.createdAt - a.createdAt);
    const trimmed = findings.slice(0, 500);

    const summary: Record<Bucket, number> = {
      math_mismatch: 0,
      split_pct_out_of_range: 0,
      host_share_exceeds_total: 0,
      runwae_share_100x: 0,
      negative_amount: 0,
    };
    for (const f of findings) summary[f.bucket]++;

    return {
      scannedRows: inWindow.length,
      windowHours: args.hours ?? null,
      summary,
      findingsCount: findings.length,
      findings: trimmed,
    };
  },
});
