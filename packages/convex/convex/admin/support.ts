import { v, ConvexError } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "../lib/admin";
import type { Doc } from "../_generated/dataModel";

const STATUS = v.union(
  v.literal("open"),
  v.literal("in_progress"),
  v.literal("resolved"),
  v.literal("closed")
);

const PRIORITY = v.union(
  v.literal("low"),
  v.literal("normal"),
  v.literal("high"),
  v.literal("urgent")
);

export const listTickets = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(STATUS),
    priority: v.optional(PRIORITY),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const baseQuery = args.status
      ? ctx.db
          .query("support_tickets")
          .withIndex("by_status", (q) =>
            q.eq("status", args.status as Doc<"support_tickets">["status"])
          )
          .order("desc")
      : ctx.db.query("support_tickets").order("desc");

    const result = await baseQuery.paginate(args.paginationOpts);

    let page = result.page;
    if (args.priority) page = page.filter((t) => t.priority === args.priority);
    if (args.search && args.search.trim()) {
      const needle = args.search.trim().toLowerCase();
      page = page.filter(
        (t) =>
          t.subject.toLowerCase().includes(needle) ||
          t.description.toLowerCase().includes(needle)
      );
    }

    const reporterIds = Array.from(new Set(page.map((t) => t.reporterId)));
    const reporters = await Promise.all(reporterIds.map((id) => ctx.db.get(id)));
    const reporterById = new Map(
      reporters
        .filter((u): u is Doc<"users"> => Boolean(u))
        .map((u) => [u._id, u])
    );

    return {
      ...result,
      page: page.map((t) => ({
        ...t,
        reporter: reporterById.get(t.reporterId)
          ? {
              _id: t.reporterId,
              name: reporterById.get(t.reporterId)!.name ?? null,
              email: reporterById.get(t.reporterId)!.email ?? null,
            }
          : null,
      })),
    };
  },
});

export const getTicket = query({
  args: { ticketId: v.id("support_tickets") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) return null;
    const reporter = await ctx.db.get(ticket.reporterId);
    const assignee = ticket.assignedToAdminId
      ? await ctx.db.get(ticket.assignedToAdminId)
      : null;
    const messages = await ctx.db
      .query("support_ticket_messages")
      .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
      .collect();
    return {
      ticket,
      reporter: reporter
        ? {
            _id: reporter._id,
            name: reporter.name ?? null,
            email: reporter.email ?? null,
          }
        : null,
      assignee: assignee
        ? {
            _id: assignee._id,
            name: assignee.name ?? null,
            email: assignee.email ?? null,
          }
        : null,
      messages,
    };
  },
});

export const assignTicket = mutation({
  args: {
    ticketId: v.id("support_tickets"),
    adminId: v.union(v.id("users"), v.null()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new ConvexError("Ticket not found");
    if (args.adminId) {
      const target = await ctx.db.get(args.adminId);
      if (!target || target.isAdmin !== true) {
        throw new ConvexError("Assignee must be an admin");
      }
    }
    await ctx.db.patch(args.ticketId, {
      assignedToAdminId: args.adminId ?? undefined,
      status: args.adminId && ticket.status === "open" ? "in_progress" : ticket.status,
      updatedAt: Date.now(),
    });
    return { _id: ticket._id, assignedBy: admin._id };
  },
});

export const setStatus = mutation({
  args: { ticketId: v.id("support_tickets"), status: STATUS },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new ConvexError("Ticket not found");
    await ctx.db.patch(args.ticketId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(args.ticketId);
  },
});

export const setPriority = mutation({
  args: { ticketId: v.id("support_tickets"), priority: PRIORITY },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new ConvexError("Ticket not found");
    await ctx.db.patch(args.ticketId, {
      priority: args.priority,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(args.ticketId);
  },
});

export const replyToTicket = mutation({
  args: {
    ticketId: v.id("support_tickets"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new ConvexError("Ticket not found");
    if (!args.body.trim()) throw new ConvexError("Reply cannot be empty");

    const now = Date.now();
    await ctx.db.insert("support_ticket_messages", {
      ticketId: args.ticketId,
      authorId: admin._id,
      authorRole: "admin",
      body: args.body.trim(),
      createdAt: now,
    });
    await ctx.db.patch(args.ticketId, {
      updatedAt: now,
      status: ticket.status === "open" ? "in_progress" : ticket.status,
      assignedToAdminId: ticket.assignedToAdminId ?? admin._id,
    });
    return null;
  },
});
