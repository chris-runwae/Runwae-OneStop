import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  query,
  mutation,
  internalAction,
  internalMutation,
  internalQuery,
  type MutationCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { cascadeDeleteTripInternal } from "./trips";

// ── Constants ──────────────────────────────────────────────────────────────

const RECOVERY_WINDOW_DAYS = 30;
const RECOVERY_WINDOW_MS = RECOVERY_WINDOW_DAYS * 24 * 60 * 60 * 1000;

// ── Sentinel "Deleted user" row ────────────────────────────────────────────

// Lazily creates (or returns) the system "Deleted user" sentinel. Financial
// records (bookings, commissions, payouts) and any other rows we want to
// preserve for audit/tax reasons get their userId rewritten to this row
// instead of being deleted.
async function getOrCreateSentinelInternal(
  ctx: MutationCtx,
): Promise<Id<"users">> {
  const existing = await ctx.db
    .query("users")
    .withIndex("by_username", (q) => q.eq("username", "deleted-user"))
    .first();
  if (existing && existing.isSystemSentinel) return existing._id;

  return await ctx.db.insert("users", {
    name: "Deleted user",
    email: "deleted@runwae.invalid",
    username: "deleted-user",
    isSystemSentinel: true,
    plan: "free",
    isHost: false,
    isAdmin: false,
    onboardingComplete: true,
    createdAt: Date.now(),
  });
}

// ── Blocker query ──────────────────────────────────────────────────────────

// Pre-deletion check returned to the UI. The dialog disables its confirm
// button until the user resolves every blocker themselves (cancel future
// bookings, transfer or cancel hosted upcoming events). The active
// subscription is informational — the dialog requires a separate checkbox
// to authorise auto-cancel via Stripe.
export const getDeletionBlockers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const now = Date.now();

    // Active bookings — anything not cancelled/completed counts. We don't
    // try to determine if travel has happened; the user is the better judge.
    const activeBookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const futureBookings = activeBookings.filter(
      (b) => b.status === "pending" || b.status === "confirmed",
    );

    // Hosted upcoming events with at least one OTHER going attendee. The
    // host themselves is auto-recorded as "going" on their own events so
    // we exclude their userId from the count. Being an attendee on someone
    // else's event is never a blocker.
    const hostedEvents = await ctx.db
      .query("events")
      .withIndex("by_host", (q) => q.eq("hostUserId", userId))
      .collect();
    const upcomingHosted = hostedEvents.filter(
      (e) => e.startDateUtc > now && e.status !== "cancelled",
    );
    const hostedUpcomingWithAttendees: typeof upcomingHosted = [];
    for (const e of upcomingHosted) {
      const attendees = await ctx.db
        .query("event_attendees")
        .withIndex("by_event", (q) => q.eq("eventId", e._id))
        .collect();
      const others = attendees.filter(
        (a) => a.userId !== userId && a.status === "going",
      );
      if (others.length > 0) hostedUpcomingWithAttendees.push(e);
    }

    // Active subscription (single row per user expected; take the first).
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    return {
      futureBookings: futureBookings.map((b) => ({
        _id: b._id,
        type: b.type,
        apiSource: b.apiSource,
        grossAmount: b.grossAmount,
        currency: b.currency,
        status: b.status,
        bookedAt: b.bookedAt,
      })),
      hostedUpcomingEventsWithAttendees: hostedUpcomingWithAttendees.map(
        (e) => ({
          _id: e._id,
          name: e.name,
          slug: e.slug,
          startDateUtc: e.startDateUtc,
        }),
      ),
      activeSubscription: subscription
        ? {
            _id: subscription._id,
            plan: subscription.plan,
            currentPeriodEnd: subscription.currentPeriodEnd,
          }
        : null,
    };
  },
});

// ── Request deletion ───────────────────────────────────────────────────────

// Soft-deletes the account and starts the 30-day recovery window. Re-runs
// the blocker check server-side (the client check could be stale). The
// `confirmCancelSubscription` flag is required iff the user has an active
// sub — UI is responsible for surfacing a checkbox.
export const requestAccountDeletion = mutation({
  args: {
    confirmCancelSubscription: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    if (user.isSystemSentinel) throw new Error("Cannot delete system user");
    if (user.deletedAt !== undefined) {
      // Already pending — return idempotently rather than erroring.
      return {
        alreadyScheduled: true,
        deletionScheduledFor: user.deletionScheduledFor,
      };
    }

    // Re-validate blockers server-side.
    const now = Date.now();

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const hasFutureBookings = bookings.some(
      (b) => b.status === "pending" || b.status === "confirmed",
    );
    if (hasFutureBookings) {
      throw new Error(
        "Resolve your active bookings before deleting your account.",
      );
    }

    const hostedEvents = await ctx.db
      .query("events")
      .withIndex("by_host", (q) => q.eq("hostUserId", userId))
      .collect();
    let hasHostedUpcoming = false;
    for (const e of hostedEvents) {
      if (e.startDateUtc <= now || e.status === "cancelled") continue;
      const attendees = await ctx.db
        .query("event_attendees")
        .withIndex("by_event", (q) => q.eq("eventId", e._id))
        .collect();
      if (attendees.some((a) => a.userId !== userId && a.status === "going")) {
        hasHostedUpcoming = true;
        break;
      }
    }
    if (hasHostedUpcoming) {
      throw new Error(
        "You're hosting upcoming events with attendees. Cancel or transfer them first.",
      );
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
    if (subscription && !args.confirmCancelSubscription) {
      throw new Error(
        "An active subscription will be cancelled. Confirm to proceed.",
      );
    }

    // Soft-delete: set the recovery window and let the cron pick it up later.
    const deletedAt = now;
    const deletionScheduledFor = now + RECOVERY_WINDOW_MS;
    await ctx.db.patch(userId, { deletedAt, deletionScheduledFor });

    // Schedule the Stripe cancel as a fire-and-forget action so the mutation
    // stays purely DB-bound. Failures are logged inside the action.
    if (subscription) {
      await ctx.scheduler.runAfter(
        0,
        internal.payments.cancelStripeSubscription,
        { stripeSubscriptionId: subscription.stripeSubscriptionId },
      );
      // Mark our local row so we don't try to bill against a cancelled sub.
      await ctx.db.patch(subscription._id, { status: "cancelled" });
    }

    return { alreadyScheduled: false, deletionScheduledFor };
  },
});

// ── Restore ────────────────────────────────────────────────────────────────

export const restoreAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    if (user.deletedAt === undefined) {
      return { alreadyActive: true };
    }
    if (
      user.deletionScheduledFor !== undefined &&
      user.deletionScheduledFor <= Date.now()
    ) {
      throw new Error(
        "Recovery window has expired. Account is being permanently deleted.",
      );
    }

    await ctx.db.patch(userId, {
      deletedAt: undefined,
      deletionScheduledFor: undefined,
    });
    return { alreadyActive: false };
  },
});

// ── Cron: pick up expired soft-deletes ─────────────────────────────────────

// Returns userIds whose recovery window has elapsed. Called by the daily
// cron action, which then invokes `hardDeleteUser` per id.
export const listExpiredSoftDeletes = internalQuery({
  args: { now: v.number(), limit: v.number() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("users")
      .withIndex("by_deletion_scheduled", (q) =>
        q.lte("deletionScheduledFor", args.now),
      )
      .take(args.limit);
    // The index is sparse on undefined, but be defensive: filter out the
    // sentinel and any rows missing the marker.
    return rows
      .filter((u) => u.deletionScheduledFor !== undefined && !u.isSystemSentinel)
      .map((u) => u._id);
  },
});

export const runScheduledDeletions = internalAction({
  args: {},
  handler: async (ctx): Promise<{ processed: number }> => {
    const now = Date.now();
    const expiredIds: Id<"users">[] = await ctx.runQuery(
      internal.account_deletion.listExpiredSoftDeletes,
      { now, limit: 50 },
    );
    let processed = 0;
    for (const userId of expiredIds) {
      try {
        await ctx.runMutation(internal.account_deletion.hardDeleteUser, {
          userId,
        });
        processed++;
      } catch (err) {
        console.error("[account_deletion] hardDeleteUser failed", {
          userId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    return { processed };
  },
});

// ── Hard cascade ───────────────────────────────────────────────────────────

// Performs the full cleanup. Order matters: child rows before parents, and
// trips are handled first so we can transfer ownership before any other
// trip-scoped data goes away.
export const hardDeleteUser = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return { skipped: "user_missing" };
    if (user.isSystemSentinel) return { skipped: "is_sentinel" };

    const userId = args.userId;
    let sentinelId: Id<"users"> | null = null;
    const getSentinel = async (): Promise<Id<"users">> => {
      if (sentinelId !== null) return sentinelId;
      sentinelId = await getOrCreateSentinelInternal(ctx);
      return sentinelId;
    };

    // 1. Trip ownership transfer / solo-trip deletion.
    const myMemberships = await ctx.db
      .query("trip_members")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const membership of myMemberships) {
      if (membership.role !== "owner") continue;

      // Find the next owner candidate among the other members. Editors first
      // (sorted by oldest joinedAt), then viewers. _creationTime would also
      // work; joinedAt better reflects "longest tenure" for invited members.
      const allMembers = await ctx.db
        .query("trip_members")
        .withIndex("by_trip", (q) => q.eq("tripId", membership.tripId))
        .collect();
      const others = allMembers.filter((m) => m.userId !== userId);

      const editors = others
        .filter((m) => m.role === "editor" && m.status === "accepted")
        .sort((a, b) => a.joinedAt - b.joinedAt);
      const viewers = others
        .filter((m) => m.role === "viewer" && m.status === "accepted")
        .sort((a, b) => a.joinedAt - b.joinedAt);
      const successor = editors[0] ?? viewers[0] ?? null;

      if (successor) {
        await ctx.db.patch(successor._id, { role: "owner" });
        await ctx.db.patch(membership.tripId, { creatorId: successor.userId });
        // Drop the deleted user's membership row; the rest of the trip stays.
        await ctx.db.delete(membership._id);
        await ctx.db.insert("notifications", {
          userId: successor.userId,
          type: "trip_invite",
          data: {
            kind: "ownership_transferred",
            tripId: membership.tripId,
            reason: "previous_owner_deleted_account",
          },
          isRead: false,
          createdAt: Date.now(),
        });
      } else {
        // Solo trip — full cascade.
        await cascadeDeleteTripInternal(ctx, membership.tripId);
      }
    }

    // 2. Remaining trip memberships (where user was editor/viewer).
    const remainingMemberships = await ctx.db
      .query("trip_members")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const m of remainingMemberships) await ctx.db.delete(m._id);

    // 3. Events the user solely hosts. By this point any with paid attendees
    // would have been blocked at request time, so the remaining ones are
    // safe to delete entirely. Co-hosted events transfer to the next userId
    // in event_hosts.
    const hostedEvents = await ctx.db
      .query("events")
      .withIndex("by_host", (q) => q.eq("hostUserId", userId))
      .collect();
    for (const event of hostedEvents) {
      const cohosts = await ctx.db
        .query("event_hosts")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();
      const successor = cohosts.find(
        (h) => h.userId !== undefined && h.userId !== userId,
      );
      if (successor && successor.userId) {
        await ctx.db.patch(event._id, { hostUserId: successor.userId });
      } else {
        // No successor: hard-delete the event and its tiers/tickets/attendees.
        const tiers = await ctx.db
          .query("event_ticket_tiers")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();
        for (const t of tiers) await ctx.db.delete(t._id);
        const tickets = await ctx.db
          .query("event_tickets")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();
        for (const t of tickets) await ctx.db.delete(t._id);
        const attendees = await ctx.db
          .query("event_attendees")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();
        for (const a of attendees) await ctx.db.delete(a._id);
        for (const h of cohosts) await ctx.db.delete(h._id);
        await ctx.db.delete(event._id);
      }
    }

    // 4. User's event participation rows (interest, tickets, co-host
    //    entries on other people's events).
    const myAttendees = await ctx.db
      .query("event_attendees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const a of myAttendees) await ctx.db.delete(a._id);
    const myTickets = await ctx.db
      .query("event_tickets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const t of myTickets) await ctx.db.delete(t._id);
    // event_hosts isn't indexed by userId so we scan a bounded window. In
    // practice users co-host very few events; if this grows we'll add an
    // index. take(1000) caps blast radius.
    const allCohosts = await ctx.db.query("event_hosts").take(1000);
    for (const h of allCohosts) {
      if (h.userId === userId) await ctx.db.delete(h._id);
    }

    // 5. Cross-trip social content authored by the user. By now the user's
    // owned trips are gone, so any remaining rows belong to OTHER trips
    // where the user contributed.
    //
    // trip_posts isn't indexed by author; scan & filter.
    const allPosts = await ctx.db.query("trip_posts").take(2000);
    for (const p of allPosts) {
      if (p.createdByUserId === userId) await ctx.db.delete(p._id);
    }
    // trip_polls + cascade.
    const allPolls = await ctx.db.query("trip_polls").take(2000);
    for (const poll of allPolls) {
      if (poll.createdByUserId !== userId) continue;
      const opts = await ctx.db
        .query("poll_options")
        .withIndex("by_poll", (q) => q.eq("pollId", poll._id))
        .collect();
      for (const o of opts) await ctx.db.delete(o._id);
      const votes = await ctx.db
        .query("poll_votes")
        .withIndex("by_poll", (q) => q.eq("pollId", poll._id))
        .collect();
      for (const v of votes) await ctx.db.delete(v._id);
      await ctx.db.delete(poll._id);
    }
    // poll_options the user added on someone else's poll.
    const allOptions = await ctx.db.query("poll_options").take(2000);
    for (const o of allOptions) {
      if (o.addedByUserId === userId) {
        // Delete this option's votes, then the option.
        const votes = await ctx.db
          .query("poll_votes")
          .withIndex("by_poll", (q) => q.eq("pollId", o.pollId))
          .filter((q) => q.eq(q.field("optionId"), o._id))
          .collect();
        for (const v of votes) await ctx.db.delete(v._id);
        await ctx.db.delete(o._id);
      }
    }
    // poll_votes by this user (vote retallying happens naturally — each
    // vote is its own row, so removing them removes them from any tally).
    const allVotes = await ctx.db.query("poll_votes").take(5000);
    for (const v of allVotes) {
      if (v.userId === userId) await ctx.db.delete(v._id);
    }
    // saved_item_comments the user authored.
    const allComments = await ctx.db.query("saved_item_comments").take(2000);
    for (const c of allComments) {
      if (c.userId === userId) await ctx.db.delete(c._id);
    }
    // checklist_items: don't delete the item, just unassign.
    const allChecklistItems = await ctx.db.query("checklist_items").take(2000);
    for (const i of allChecklistItems) {
      if (i.assignedToUserId === userId) {
        await ctx.db.patch(i._id, { assignedToUserId: undefined });
      }
    }
    // trip_checklists authored by the user (only on trips that survived the
    // owner-promotion path — meaning they're now owned by someone else).
    const allChecklists = await ctx.db.query("trip_checklists").take(2000);
    for (const cl of allChecklists) {
      if (cl.createdByUserId !== userId) continue;
      const items = await ctx.db
        .query("checklist_items")
        .withIndex("by_checklist", (q) => q.eq("checklistId", cl._id))
        .collect();
      for (const i of items) await ctx.db.delete(i._id);
      await ctx.db.delete(cl._id);
    }
    // saved_items added by this user on trips they no longer own.
    const mySavedItems = await ctx.db
      .query("saved_items")
      .withIndex("by_added_by", (q) => q.eq("addedByUserId", userId))
      .collect();
    for (const s of mySavedItems) await ctx.db.delete(s._id);

    // 6. Expense splits: delete the user's own split debts. For expenses
    //    they paid (other people owe them), preserve the row but rewrite
    //    paidByUserId to sentinel so other members' UI still works.
    const mySplits = await ctx.db
      .query("expense_splits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const s of mySplits) await ctx.db.delete(s._id);
    // Expenses created by this user — scan all (no by_payer index). Bounded
    // sweep; if an instance has thousands of expenses across all trips we'd
    // need an index, but for B2C consumer scale this is fine.
    const allExpenses = await ctx.db.query("expenses").take(5000);
    for (const e of allExpenses) {
      if (e.paidByUserId === userId) {
        const sentinel = await getSentinel();
        await ctx.db.patch(e._id, { paidByUserId: sentinel });
      }
    }

    // 7. Reviews, friendships, notifications, saved_items (user_saves),
    //    ai_trips, issue_reports, share_links.
    const myReviews = await ctx.db
      .query("reviews")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const r of myReviews) await ctx.db.delete(r._id);

    const friendshipsAsRequester = await ctx.db
      .query("friendships")
      .withIndex("by_requester", (q) => q.eq("requesterId", userId))
      .collect();
    for (const f of friendshipsAsRequester) await ctx.db.delete(f._id);
    const friendshipsAsAddressee = await ctx.db
      .query("friendships")
      .withIndex("by_addressee", (q) => q.eq("addresseeId", userId))
      .collect();
    for (const f of friendshipsAsAddressee) await ctx.db.delete(f._id);

    // notifications has a compound index by_user_unread; range over it.
    const myNotifs = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => q.eq("userId", userId))
      .collect();
    for (const n of myNotifs) await ctx.db.delete(n._id);

    const myUserSaves = await ctx.db
      .query("user_saves")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const s of myUserSaves) await ctx.db.delete(s._id);

    const myAiTrips = await ctx.db
      .query("ai_trips")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const a of myAiTrips) await ctx.db.delete(a._id);

    // share_links isn't indexed by author; scan & filter.
    const allShares = await ctx.db.query("share_links").take(5000);
    for (const s of allShares) {
      if (s.createdByUserId === userId) await ctx.db.delete(s._id);
    }

    // issue_reports: scan & filter (indexed by status only).
    const allIssues = await ctx.db.query("issue_reports").take(5000);
    for (const i of allIssues) {
      if (i.userId === userId) await ctx.db.delete(i._id);
    }

    // 8. Subscriptions — already cancelled at request time. Rewrite to
    //    sentinel for audit trail.
    const mySubs = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (mySubs.length > 0) {
      const sentinel = await getSentinel();
      for (const s of mySubs) await ctx.db.patch(s._id, { userId: sentinel });
    }

    // 9. Bookings — anonymise (rewrite userId to sentinel).
    const myBookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (myBookings.length > 0) {
      const sentinel = await getSentinel();
      for (const b of myBookings)
        await ctx.db.patch(b._id, { userId: sentinel });
    }

    // 10. Commissions / payouts — anonymise hostId.
    const myCommissions = await ctx.db
      .query("commissions")
      .withIndex("by_host", (q) => q.eq("hostId", userId))
      .collect();
    if (myCommissions.length > 0) {
      const sentinel = await getSentinel();
      for (const c of myCommissions)
        await ctx.db.patch(c._id, { hostId: sentinel });
    }
    const myPayouts = await ctx.db
      .query("payouts")
      .withIndex("by_host", (q) => q.eq("hostId", userId))
      .collect();
    if (myPayouts.length > 0) {
      const sentinel = await getSentinel();
      for (const p of myPayouts)
        await ctx.db.patch(p._id, { hostId: sentinel });
    }

    // 11. Auth identity rows. @convex-dev/auth doesn't expose a single
    //     deleteUser — iterate the auth-managed tables directly. Field
    //     names follow the @convex-dev/auth schema (authAccounts has
    //     `userId`, authSessions has `userId`, etc).
    const authTablesToScan: Array<
      "authAccounts" | "authSessions" | "authVerificationCodes" | "authVerifiers"
    > = ["authAccounts", "authSessions", "authVerificationCodes"];
    for (const table of authTablesToScan) {
      try {
        const rows = await ctx.db
          .query(table as any)
          .filter((q: any) => q.eq(q.field("userId"), userId))
          .take(500);
        for (const row of rows) await ctx.db.delete(row._id);
      } catch (err) {
        // Defensive: if the auth schema changes we don't want this to crash
        // the whole cascade — log and continue.
        console.error(`[account_deletion] auth table sweep failed: ${table}`, err);
      }
    }

    // 12. Finally, the user row itself.
    await ctx.db.delete(userId);

    return { ok: true };
  },
});
