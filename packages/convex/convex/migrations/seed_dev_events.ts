import { v, ConvexError } from "convex/values";
import { internalMutation } from "../_generated/server";

// Dev seed for the admin events surface. Inserts a status-diverse set of
// events so the admin filters (draft / published / cancelled / completed)
// and trending toggle have something to render. Idempotent — skips inserts
// whose slug already exists.
//
// Run manually (requires explicit `confirm: true` so it never fires
// accidentally — internalMutation is already locked down but this is a
// belt-and-braces guard against running against the wrong deployment):
//   npx convex run migrations/seed_dev_events:run '{"confirm": true}'
export const run = internalMutation({
  args: { confirm: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    if (!args.confirm) {
      throw new ConvexError(
        "Refusing to run dev seed without explicit confirm. " +
          "Re-run with `npx convex run migrations/seed_dev_events:run '{\"confirm\": true}'`."
      );
    }

    const host = await ctx.db.query("users").first();
    if (!host) {
      throw new ConvexError(
        "Need at least one user in the DB to host seeded events"
      );
    }

    const day = 86_400_000;
    const now = Date.now();

    // Each sample maps to a different status so the admin filters have
    // coverage. One published event is also marked trending so the
    // trending toggle has at least one match out of the box.
    const samples: Array<{
      slug: string;
      name: string;
      description: string;
      locationName: string;
      timezone: string;
      startOffsetDays: number;
      durationHours: number;
      category: string;
      status: "draft" | "published" | "cancelled" | "completed";
      isTrending: boolean;
      adminNotes?: string;
    }> = [
      {
        slug: "admin-seed-draft-yoga-retreat",
        name: "[seed:draft] Andalusia Yoga Retreat",
        description: "Five-day mountain retreat — host still finalising the schedule.",
        locationName: "Sierra Nevada, Spain",
        timezone: "Europe/Madrid",
        startOffsetDays: 60,
        durationHours: 24 * 5,
        category: "wellness",
        status: "draft" as const,
        isTrending: false,
      },
      {
        slug: "admin-seed-published-launch-party",
        name: "[seed:published] Runwae Launch Party",
        description: "Open-house mixer for early users and travel hosts.",
        locationName: "Hackney, London",
        timezone: "Europe/London",
        startOffsetDays: 18,
        durationHours: 5,
        category: "community",
        status: "published" as const,
        isTrending: true,
        // Populated so the public-query leak test has a string to grep for.
        adminNotes:
          "INTERNAL: VIP guest list with founders attending. Do not surface to host.",
      },
      {
        slug: "admin-seed-published-night-market",
        name: "[seed:published] Borough Market Night",
        description: "Late-night food market takeover with twelve guest stalls.",
        locationName: "Borough, London",
        timezone: "Europe/London",
        startOffsetDays: 25,
        durationHours: 6,
        category: "food",
        status: "published" as const,
        isTrending: false,
      },
      {
        slug: "admin-seed-cancelled-mountain-trek",
        name: "[seed:cancelled] Cairngorms Trek (Cancelled)",
        description: "Cancelled by host due to weather warnings.",
        locationName: "Cairngorms, Scotland",
        timezone: "Europe/London",
        startOffsetDays: 12,
        durationHours: 24 * 2,
        category: "outdoors",
        status: "cancelled" as const,
        isTrending: false,
      },
      {
        slug: "admin-seed-completed-jazz-brunch",
        name: "[seed:completed] Jazz Brunch (Past)",
        description: "Sold-out brunch with live trio — now in the books.",
        locationName: "Brixton, London",
        timezone: "Europe/London",
        startOffsetDays: -14,
        durationHours: 4,
        category: "music",
        status: "completed" as const,
        isTrending: false,
      },
    ];

    let inserted = 0;
    for (const s of samples) {
      const existing = await ctx.db
        .query("events")
        .withIndex("by_slug", (q) => q.eq("slug", s.slug))
        .unique();
      if (existing) continue;

      const startDateUtc = now + s.startOffsetDays * day;
      const imageUrl = `https://picsum.photos/seed/${s.slug}/800/600`;
      await ctx.db.insert("events", {
        name: s.name,
        description: s.description,
        hostUserId: host._id,
        locationName: s.locationName,
        timezone: s.timezone,
        startDateUtc,
        endDateUtc: startDateUtc + s.durationHours * 60 * 60 * 1000,
        category: s.category,
        imageUrl,
        imageUrls: [imageUrl],
        slug: s.slug,
        status: s.status,
        ticketingMode: "free",
        commissionSplitPct: 0,
        currentParticipants: 0,
        viewCount: 0,
        isTrending: s.isTrending,
        trendingRank: s.isTrending ? 1 : undefined,
        adminNotes: s.adminNotes,
        createdAt: now,
        updatedAt: now,
      });
      inserted += 1;
    }

    return { inserted, total: samples.length };
  },
});
