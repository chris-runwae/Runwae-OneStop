import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // ── AUTH & IDENTITY ────────────────────────────────────────
  // Merges @convex-dev/auth required fields with Runwae app fields.
  // Auth inserts the row first, so all app fields are optional.
  users: defineTable({
    // Auth fields (required by @convex-dev/auth at runtime)
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // App fields
    avatarUrl: v.optional(v.string()),
    plan: v.optional(v.union(v.literal("free"), v.literal("pro"))),
    isHost: v.optional(v.boolean()),
    isAdmin: v.optional(v.boolean()),
    preferredCurrency: v.optional(v.string()),
    preferredTimezone: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    stripeConnectId: v.optional(v.string()),
    onboardingComplete: v.optional(v.boolean()),
    travellerTags: v.optional(v.array(v.string())),
    username: v.optional(v.string()),
    homeCoords: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    homeCity: v.optional(v.string()),
    homeCountry: v.optional(v.string()),
    homeIata: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_username", ["username"]),

  friendships: defineTable({
    requesterId: v.id("users"),
    addresseeId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("blocked")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_requester", ["requesterId"])
    .index("by_addressee", ["addresseeId"])
    .index("by_pair", ["requesterId", "addresseeId"]),

  // ── CORE ENTITIES ──────────────────────────────────────────
  destinations: defineTable({
    name: v.string(),
    country: v.string(),
    region: v.optional(v.string()),
    heroImageUrl: v.string(),
    imageUrls: v.array(v.string()),
    description: v.optional(v.string()),
    isFeatured: v.boolean(),
    featuredRank: v.optional(v.number()),
    tags: v.array(v.string()),
    coords: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    timezone: v.string(),
    currency: v.string(),
    ratingAverage: v.number(),
    ratingCount: v.number(),
    slug: v.string(),
    createdAt: v.number(),
  })
    .index("by_featured", ["isFeatured"])
    .index("by_slug", ["slug"]),

  experiences: defineTable({
    title: v.string(),
    destinationId: v.id("destinations"),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageUrls: v.array(v.string()),
    price: v.optional(v.number()),
    currency: v.string(),
    durationMinutes: v.optional(v.number()),
    apiSource: v.optional(v.string()),
    apiRef: v.optional(v.string()),
    isFeatured: v.boolean(),
    ratingAverage: v.number(),
    ratingCount: v.number(),
    included: v.array(v.string()),
    whatToKnow: v.array(v.string()),
    coords: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    slug: v.string(),
    createdAt: v.number(),
  })
    .index("by_destination", ["destinationId"])
    .index("by_slug", ["slug"]),

  itinerary_templates: defineTable({
    title: v.string(),
    destinationId: v.id("destinations"),
    description: v.optional(v.string()),
    durationDays: v.number(),
    difficultyLevel: v.optional(
      v.union(
        v.literal("easy"),
        v.literal("moderate"),
        v.literal("challenging")
      )
    ),
    category: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    days: v.array(
      v.object({
        dayNumber: v.number(),
        title: v.string(),
        items: v.array(
          v.object({
            time: v.optional(v.string()),
            title: v.string(),
            description: v.optional(v.string()),
            type: v.string(),
            locationName: v.optional(v.string()),
            coords: v.optional(
              v.object({ lat: v.number(), lng: v.number() })
            ),
            estimatedCost: v.optional(v.number()),
            currency: v.optional(v.string()),
            apiSource: v.optional(v.string()),
            apiRef: v.optional(v.string()),
          })
        ),
      })
    ),
    estimatedTotalCost: v.optional(v.number()),
    currency: v.string(),
    isFeatured: v.boolean(),
    timesCopied: v.number(),
    status: v.union(v.literal("draft"), v.literal("published")),
    createdByAdminId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_destination", ["destinationId"])
    .index("by_featured", ["isFeatured"]),

  collections: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    entityType: v.union(
      v.literal("event"),
      v.literal("destination"),
      v.literal("experience"),
      v.literal("trip")
    ),
    entityIds: v.array(v.string()),
    isActive: v.boolean(),
    rank: v.number(),
    createdByAdminId: v.id("users"),
    createdAt: v.number(),
  }).index("by_entity_type", ["entityType"]),

  // ── TRIPS ──────────────────────────────────────────────────
  trips: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    destinationId: v.optional(v.id("destinations")),
    destinationLabel: v.optional(v.string()),
    destinationCoords: v.optional(
      v.object({ lat: v.number(), lng: v.number() })
    ),
    creatorId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
    category: v.optional(
      v.union(
        v.literal("leisure"),
        v.literal("business"),
        v.literal("family"),
        v.literal("adventure"),
        v.literal("cultural"),
        v.literal("romantic")
      )
    ),
    visibility: v.union(
      v.literal("private"),
      v.literal("invite_only"),
      v.literal("friends"),
      v.literal("public")
    ),
    status: v.union(
      v.literal("planning"),
      v.literal("upcoming"),
      v.literal("ongoing"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    coverImageUrl: v.optional(v.string()),
    ogImageStorageId: v.optional(v.id("_storage")),
    slug: v.string(),
    joinCode: v.string(),
    estimatedBudget: v.optional(v.number()),
    currency: v.string(),
    clonedFromId: v.optional(v.id("trips")),
    sourceTemplateId: v.optional(v.id("itinerary_templates")),
    eventId: v.optional(v.id("events")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_creator", ["creatorId"])
    .index("by_slug", ["slug"])
    .index("by_join_code", ["joinCode"])
    .index("by_event", ["eventId"]),

  trip_members: defineTable({
    tripId: v.id("trips"),
    userId: v.id("users"),
    role: v.union(
      v.literal("owner"),
      v.literal("editor"),
      v.literal("viewer")
    ),
    invitedBy: v.optional(v.id("users")),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined")
    ),
    joinedAt: v.number(),
  })
    .index("by_trip", ["tripId"])
    .index("by_user", ["userId"]),

  // ── SAVED ITEMS ────────────────────────────────────────────
  saved_items: defineTable({
    tripId: v.id("trips"),
    addedByUserId: v.id("users"),
    type: v.union(
      v.literal("flight"),
      v.literal("hotel"),
      v.literal("tour"),
      v.literal("car_rental"),
      v.literal("event"),
      v.literal("restaurant"),
      v.literal("activity"),
      v.literal("transport"),
      v.literal("other")
    ),
    apiSource: v.optional(v.string()),
    apiRef: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    date: v.optional(v.string()),
    endDate: v.optional(v.string()),
    locationName: v.optional(v.string()),
    coords: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    externalUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    isManual: v.boolean(),
    addedToItinerary: v.boolean(),
    itineraryItemId: v.optional(v.id("itinerary_items")),
    createdAt: v.number(),
  })
    .index("by_trip", ["tripId"])
    .index("by_trip_type", ["tripId", "type"])
    .index("by_added_by", ["addedByUserId"]),

  // User-level "likes" — saves outside any specific trip. Used by the heart
  // icon on Discover cards and the /saved page. Distinct from `saved_items`
  // which is trip-scoped.
  user_saves: defineTable({
    userId: v.id("users"),
    category: v.union(
      v.literal("hotel"),
      v.literal("flight"),
      v.literal("tour"),
      v.literal("activity"),
      v.literal("restaurant"),
      v.literal("event"),
      v.literal("destination"),
      v.literal("trip"),
      v.literal("other")
    ),
    provider: v.string(),         // "viator" | "duffel" | "liteapi" | "static" | "internal" | …
    apiRef: v.string(),           // provider-side ID (or internal record id stringified)
    title: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    locationName: v.optional(v.string()),
    coords: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    externalUrl: v.optional(v.string()),
    rating: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_category", ["userId", "category"])
    .index("by_user_ref", ["userId", "provider", "apiRef"]),

  // ── ITINERARY ──────────────────────────────────────────────
  itinerary_days: defineTable({
    tripId: v.id("trips"),
    date: v.string(),
    dayNumber: v.number(),
    title: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_trip", ["tripId"])
    .index("by_trip_day", ["tripId", "dayNumber"]),

  itinerary_items: defineTable({
    tripId: v.id("trips"),
    dayId: v.id("itinerary_days"),
    addedByUserId: v.id("users"),
    savedItemId: v.optional(v.id("saved_items")),
    type: v.union(
      v.literal("flight"),
      v.literal("hotel"),
      v.literal("tour"),
      v.literal("car_rental"),
      v.literal("event"),
      v.literal("restaurant"),
      v.literal("activity"),
      v.literal("transport"),
      v.literal("other")
    ),
    apiSource: v.optional(v.string()),
    apiRef: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    locationName: v.optional(v.string()),
    coords: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    bookingReference: v.optional(v.string()),
    notes: v.optional(v.string()),
    isCompleted: v.boolean(),
    sortOrder: v.number(),
    canBeEditedBy: v.union(
      v.literal("creator_only"),
      v.literal("editors"),
      v.literal("all_members")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_trip", ["tripId"])
    .index("by_day", ["dayId"]),

  // ── TRIP SOCIAL LAYER ──────────────────────────────────────
  trip_posts: defineTable({
    tripId: v.id("trips"),
    createdByUserId: v.id("users"),
    content: v.string(),
    imageUrls: v.optional(v.array(v.string())),
    savedItemId: v.optional(v.id("saved_items")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_trip", ["tripId"])
    .index("by_saved_item", ["savedItemId"]),

  trip_polls: defineTable({
    tripId: v.id("trips"),
    createdByUserId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("single_choice"),
      v.literal("multi_choice"),
      v.literal("ranked")
    ),
    status: v.union(v.literal("open"), v.literal("closed")),
    closesAt: v.optional(v.number()),
    allowAddOptions: v.boolean(),
    isAnonymous: v.boolean(),
    createdAt: v.number(),
  }).index("by_trip", ["tripId"]),

  poll_options: defineTable({
    pollId: v.id("trip_polls"),
    label: v.string(),
    addedByUserId: v.id("users"),
    savedItemId: v.optional(v.id("saved_items")),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_poll", ["pollId"])
    .index("by_saved_item", ["savedItemId"]),

  poll_votes: defineTable({
    pollId: v.id("trip_polls"),
    optionId: v.id("poll_options"),
    userId: v.id("users"),
    rank: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_poll", ["pollId"])
    .index("by_poll_user", ["pollId", "userId"]),

  trip_checklists: defineTable({
    tripId: v.id("trips"),
    createdByUserId: v.id("users"),
    title: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_trip", ["tripId"]),

  checklist_items: defineTable({
    checklistId: v.id("trip_checklists"),
    title: v.string(),
    isDone: v.boolean(),
    assignedToUserId: v.optional(v.id("users")),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_checklist", ["checklistId"]),

  expenses: defineTable({
    tripId: v.id("trips"),
    paidByUserId: v.id("users"),
    amount: v.number(),
    currency: v.string(),
    category: v.union(
      v.literal("accommodation"),
      v.literal("transport"),
      v.literal("food"),
      v.literal("activity"),
      v.literal("shopping"),
      v.literal("other")
    ),
    date: v.string(),
    description: v.optional(v.string()),
    splitType: v.union(v.literal("equal"), v.literal("custom")),
    receiptImageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_trip", ["tripId"]),

  expense_splits: defineTable({
    expenseId: v.id("expenses"),
    userId: v.id("users"),
    amountOwed: v.number(),
    currency: v.string(),
    isSettled: v.boolean(),
    settledAt: v.optional(v.number()),
  })
    .index("by_expense", ["expenseId"])
    .index("by_user", ["userId"]),

  // ── EVENTS ─────────────────────────────────────────────────
  events: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    hostUserId: v.id("users"),
    destinationId: v.optional(v.id("destinations")),
    locationName: v.string(),
    locationCoords: v.optional(
      v.object({ lat: v.number(), lng: v.number() })
    ),
    timezone: v.string(),
    startDateUtc: v.number(),
    endDateUtc: v.optional(v.number()),
    category: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageUrls: v.array(v.string()),
    slug: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("cancelled"),
      v.literal("completed")
    ),
    ticketingMode: v.union(
      v.literal("runwae"),
      v.literal("external"),
      v.literal("free"),
      v.literal("none")
    ),
    externalTicketUrl: v.optional(v.string()),
    commissionSplitPct: v.number(),
    currentParticipants: v.number(),
    viewCount: v.number(),
    ogImageStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_host", ["hostUserId"])
    .index("by_slug", ["slug"])
    .index("by_destination", ["destinationId"]),

  event_ticket_tiers: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    currency: v.string(),
    quantity: v.number(),
    quantitySold: v.number(),
    maxPerOrder: v.optional(v.number()),
    saleStartsAt: v.optional(v.number()),
    saleEndsAt: v.optional(v.number()),
    isVisible: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
  }).index("by_event", ["eventId"]),

  event_tickets: defineTable({
    eventId: v.id("events"),
    tierId: v.id("event_ticket_tiers"),
    userId: v.id("users"),
    bookingId: v.optional(v.id("bookings")),
    ticketCode: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("used"),
      v.literal("cancelled")
    ),
    checkedInAt: v.optional(v.number()),
    issuedAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_code", ["ticketCode"]),

  event_attendees: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    tripId: v.optional(v.id("trips")),
    status: v.union(
      v.literal("interested"),
      v.literal("going"),
      v.literal("not_going")
    ),
    createdAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"]),

  event_hosts: defineTable({
    eventId: v.id("events"),
    userId: v.optional(v.id("users")),
    name: v.string(),
    email: v.string(),
    showOnPage: v.boolean(),
    isManager: v.boolean(),
    createdAt: v.number(),
  }).index("by_event", ["eventId"]),

  // ── REVIEWS ────────────────────────────────────────────────
  reviews: defineTable({
    entityType: v.union(
      v.literal("experience"),
      v.literal("destination"),
      v.literal("event"),
      v.literal("hotel")
    ),
    entityId: v.string(),
    userId: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
    helpfulCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_entity", ["entityType", "entityId"])
    .index("by_user", ["userId"]),

  // ── REVENUE ────────────────────────────────────────────────
  bookings: defineTable({
    userId: v.id("users"),
    tripId: v.optional(v.id("trips")),
    eventId: v.optional(v.id("events")),
    type: v.union(
      v.literal("flight"),
      v.literal("hotel"),
      v.literal("tour"),
      v.literal("car_rental"),
      v.literal("event_ticket")
    ),
    apiSource: v.string(),
    apiRef: v.string(),
    grossAmount: v.number(),
    currency: v.string(),
    commissionAmount: v.number(),
    stripePaymentIntentId: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed")
    ),
    rawResponse: v.optional(v.any()),
    bookedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_event", ["eventId"])
    .index("by_trip", ["tripId"]),

  commissions: defineTable({
    bookingId: v.id("bookings"),
    eventId: v.optional(v.id("events")),
    hostId: v.optional(v.id("users")),
    totalCommission: v.number(),
    runwaeShare: v.number(),
    hostShare: v.number(),
    splitPct: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("held")
    ),
    createdAt: v.number(),
  })
    .index("by_booking", ["bookingId"])
    .index("by_host", ["hostId"]),

  payouts: defineTable({
    hostId: v.id("users"),
    amount: v.number(),
    currency: v.string(),
    stripeTransferId: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("paid"),
      v.literal("failed")
    ),
    periodStart: v.number(),
    periodEnd: v.number(),
    commissionIds: v.array(v.id("commissions")),
    createdAt: v.number(),
  }).index("by_host", ["hostId"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    plan: v.literal("pro"),
    stripeSubscriptionId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("past_due")
    ),
    currentPeriodEnd: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // ── PLATFORM ───────────────────────────────────────────────
  share_links: defineTable({
    entityId: v.string(),
    entityType: v.union(
      v.literal("trip"),
      v.literal("event"),
      v.literal("destination"),
      v.literal("hotel"),
      v.literal("experience"),
      v.literal("itinerary_template")
    ),
    slug: v.string(),
    createdByUserId: v.id("users"),
    clicks: v.number(),
    refTripId: v.optional(v.id("trips")),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_entity", ["entityId", "entityType"]),

  exchange_rates: defineTable({
    baseCurrency: v.string(),
    rates: v.any(),
    fetchedAt: v.number(),
  }).index("by_base", ["baseCurrency"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("trip_invite"),
      v.literal("friend_request"),
      v.literal("friend_accepted"),
      v.literal("friend_trip_created"),
      v.literal("trip_item_saved"),
      v.literal("poll_created"),
      v.literal("poll_closed"),
      v.literal("expense_added"),
      v.literal("expense_settled"),
      v.literal("payout_ready"),
      v.literal("booking_confirmed"),
      v.literal("trip_cloned"),
      v.literal("event_reminder"),
      v.literal("ticket_issued")
    ),
    data: v.any(),
    isRead: v.boolean(),
    createdAt: v.number(),
  }).index("by_user_unread", ["userId", "isRead"]),

  ai_trips: defineTable({
    userId: v.id("users"),
    prompt: v.string(),
    result: v.optional(v.string()),
    tripId: v.optional(v.id("trips")),
    status: v.union(
      v.literal("pending"),
      v.literal("complete"),
      v.literal("failed")
    ),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  issue_reports: defineTable({
    userId: v.id("users"),
    issueType: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("open"),
      v.literal("resolved"),
      v.literal("closed")
    ),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  // ── TRIP CREATION / DISCOVER ───────────────────────────────
  saved_item_comments: defineTable({
    tripId: v.id("trips"),
    savedItemId: v.id("saved_items"),
    userId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_saved_item", ["savedItemId"])
    .index("by_trip", ["tripId"]),

  discovery_cache: defineTable({
    provider: v.string(),
    category: v.string(),
    queryKey: v.string(),
    expiresAt: v.number(),
    payload: v.any(),
  })
    .index("by_key", ["provider", "category", "queryKey"])
    .index("by_category_key", ["category", "queryKey"]),
});
