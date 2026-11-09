CREATE TABLE `rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`rev` integer DEFAULT 0 NOT NULL,
	`updated` integer NOT NULL
);
