import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

const CATEGORY = v.union(
  v.literal("booking"),
  v.literal("payment"),
  v.literal("event"),
  v.literal("account"),
  v.literal("other")
);

export const createTicket = mutation({
  args: {
    category: CATEGORY,
    subject: v.string(),
    description: v.string(),
    relatedBookingId: v.optional(v.id("bookings")),
    relatedEventId: v.optional(v.id("events")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    if (!args.subject.trim()) throw new ConvexError("Subject is required");
    if (!args.description.trim())
      throw new ConvexError("Description is required");

    const now = Date.now();
    const ticketId = await ctx.db.insert("support_tickets", {
      reporterId: userId,
      category: args.category,
      subject: args.subject.trim(),
      description: args.description.trim(),
      status: "open",
      priority: "normal",
      relatedBookingId: args.relatedBookingId,
      relatedEventId: args.relatedEventId,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("support_ticket_messages", {
      ticketId,
      authorId: userId,
      authorRole: "user",
      body: args.description.trim(),
      createdAt: now,
    });

    return await ctx.db.get(ticketId);
  },
});

export const listMyTickets = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("support_tickets")
      .withIndex("by_reporter", (q) => q.eq("reporterId", userId))
      .order("desc")
      .take(limit);
  },
});

export const getMyTicket = query({
  args: { ticketId: v.id("support_tickets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket || ticket.reporterId !== userId) return null;
    const messages = await ctx.db
      .query("support_ticket_messages")
      .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
      .collect();
    return { ticket, messages };
  },
});

export const addMessage = mutation({
  args: {
    ticketId: v.id("support_tickets"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new ConvexError("Ticket not found");
    if (ticket.reporterId !== userId) throw new ConvexError("Forbidden");
    if (ticket.status === "closed") {
      throw new ConvexError("Cannot reply to a closed ticket");
    }
    if (!args.body.trim()) throw new ConvexError("Message cannot be empty");

    const now = Date.now();
    await ctx.db.insert("support_ticket_messages", {
      ticketId: args.ticketId,
      authorId: userId,
      authorRole: "user",
      body: args.body.trim(),
      createdAt: now,
    });
    await ctx.db.patch(args.ticketId, { updatedAt: now });
    return null;
  },
});
