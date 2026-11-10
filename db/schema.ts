import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { Game } from "../lib/game";
import type { MapSettings } from "../lib/map-settings";

export const rooms = pgTable("rooms", {
  code: text("code").primaryKey(),
  state: jsonb("state").$type<Game>().notNull(),
  rev: integer("rev").notNull().default(0),
  updated: timestamp("updated", { withTimezone: true }).notNull().defaultNow(),
});

export const mapSettings = pgTable("map_settings", {
  id: text("id").primaryKey(),
  settings: jsonb("settings").$type<MapSettings>().notNull(),
  updated: timestamp("updated", { withTimezone: true }).notNull().defaultNow(),
});
