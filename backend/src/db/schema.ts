import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Example table – extend or replace with your Runwae schema.
 * Run `npm run db:generate` to generate migrations.
 */
export const example = pgTable("example", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Example = typeof example.$inferSelect;
export type NewExample = typeof example.$inferInsert;
