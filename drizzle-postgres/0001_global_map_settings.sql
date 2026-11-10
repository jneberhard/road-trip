CREATE TABLE "map_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"settings" jsonb NOT NULL,
	"updated" timestamp with time zone DEFAULT now() NOT NULL
);
