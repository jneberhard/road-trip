import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { Game } from "../lib/game";

export const rooms = pgTable("rooms", {
  code: text("code").primaryKey(),
  state: jsonb("state").$type<Game>().notNull(),
  rev: integer("rev").notNull().default(0),
  updated: timestamp("updated", { withTimezone: true }).notNull().defaultNow(),
});
