import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  users: authTables.users.extend({
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    currency: v.optional(v.string()),
    timezone: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_username", ["username"]),

  trips: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    createdBy: v.id("users"),
    budget: v.optional(v.number()),
    currency: v.string(),
    notes: v.optional(v.string()),
    visibility: v.union(
      v.literal("private"),
      v.literal("invite_only"),
      v.literal("public")
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    destinationIds: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_creator", ["createdBy"]),

  trip_members: defineTable({
    tripId: v.id("trips"),
    userId: v.id("users"),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member")
    ),
    joinedAt: v.number(),
  })
    .index("by_trip", ["tripId"])
    .index("by_user", ["userId"])
    .index("by_trip_user", ["tripId", "userId"]),

  events: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    gallery: v.array(v.string()),
    startAt: v.optional(v.number()),
    endAt: v.optional(v.number()),
    location: v.optional(v.string()),
    destinationId: v.optional(v.id("destinations")),
    price: v.optional(v.number()),
    currency: v.string(),
    capacity: v.optional(v.number()),
    registrationCount: v.number(),
    featured: v.boolean(),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("cancelled")
    ),
    joinCode: v.optional(v.string()),
    createdBy: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_destination", ["destinationId"])
    .index("by_featured", ["featured"])
    .index("by_join_code", ["joinCode"]),

  event_hosts: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    email: v.string(),
    showOnPage: v.boolean(),
    isManager: v.boolean(),
    createdAt: v.number(),
  }).index("by_event", ["eventId"]),

  event_sub_events: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    startsAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_event", ["eventId"]),

  event_registrations: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled")
    ),
    registeredAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_event_user", ["eventId", "userId"]),

  destinations: defineTable({
    title: v.string(),
    slug: v.string(),
    location: v.string(),
    imageUrl: v.optional(v.string()),
    gallery: v.array(v.string()),
    rating: v.optional(v.number()),
    reviewCount: v.number(),
    description: v.optional(v.string()),
    featured: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_featured", ["featured"]),

  experiences: defineTable({
    title: v.string(),
    slug: v.string(),
    category: v.optional(v.string()),
    rating: v.optional(v.number()),
    reviewCount: v.number(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    gallery: v.array(v.string()),
    price: v.optional(v.number()),
    currency: v.string(),
    featured: v.boolean(),
    included: v.array(v.string()),
    whatToKnow: v.array(v.string()),
    itinerarySteps: v.array(
      v.object({ time: v.string(), description: v.string() })
    ),
    destinationId: v.optional(v.id("destinations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_destination", ["destinationId"])
    .index("by_featured", ["featured"])
    .index("by_slug", ["slug"]),

  reviews: defineTable({
    entityType: v.union(
      v.literal("experience"),
      v.literal("destination"),
      v.literal("event")
    ),
    entityId: v.string(),
    userId: v.optional(v.id("users")),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    rating: v.number(),
    comment: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_entity", ["entityType", "entityId"]),

  itineraries: defineTable({
    tripId: v.id("trips"),
    title: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_trip", ["tripId"]),

  itinerary_days: defineTable({
    itineraryId: v.id("itineraries"),
    date: v.number(),
    dayNumber: v.number(),
    createdAt: v.number(),
  }).index("by_itinerary", ["itineraryId"]),

  itinerary_items: defineTable({
    itineraryDayId: v.id("itinerary_days"),
    title: v.string(),
    type: v.union(
      v.literal("activity"),
      v.literal("restaurant"),
      v.literal("hotel"),
      v.literal("transport"),
      v.literal("other")
    ),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    experienceId: v.optional(v.id("experiences")),
    cost: v.optional(v.number()),
    currency: v.optional(v.string()),
    order: v.number(),
    createdAt: v.number(),
  }).index("by_day", ["itineraryDayId"]),

  saved_items: defineTable({
    userId: v.id("users"),
    entityType: v.union(
      v.literal("trip"),
      v.literal("event"),
      v.literal("destination"),
      v.literal("experience")
    ),
    entityId: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_entity", ["userId", "entityType", "entityId"]),

  bookings: defineTable({
    userId: v.id("users"),
    experienceId: v.optional(v.id("experiences")),
    tripId: v.optional(v.id("trips")),
    eventId: v.optional(v.id("events")),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    amount: v.number(),
    currency: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    stripeSessionId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_stripe_session", ["stripeSessionId"]),

  commissions: defineTable({
    bookingId: v.id("bookings"),
    amount: v.number(),
    currency: v.string(),
    rate: v.number(),
    status: v.union(v.literal("pending"), v.literal("paid")),
    paidAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_booking", ["bookingId"]),

  expenses: defineTable({
    tripId: v.id("trips"),
    paidBy: v.id("users"),
    title: v.string(),
    amount: v.number(),
    currency: v.string(),
    category: v.optional(v.string()),
    splitMethod: v.union(v.literal("equal"), v.literal("custom")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_trip", ["tripId"]),

  expense_splits: defineTable({
    expenseId: v.id("expenses"),
    userId: v.id("users"),
    amount: v.number(),
    isSettled: v.boolean(),
    settledAt: v.optional(v.number()),
  })
    .index("by_expense", ["expenseId"])
    .index("by_user", ["userId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    read: v.boolean(),
    data: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "read"]),
});
