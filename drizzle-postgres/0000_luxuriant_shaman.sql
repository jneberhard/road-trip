CREATE TABLE "rooms" (
	"code" text PRIMARY KEY NOT NULL,
	"state" jsonb NOT NULL,
	"rev" integer DEFAULT 0 NOT NULL,
	"updated" timestamp with time zone DEFAULT now() NOT NULL
);
