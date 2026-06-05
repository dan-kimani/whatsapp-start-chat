CREATE TABLE `recent_contacts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phone_number` text NOT NULL,
	`country_code` text NOT NULL,
	`country` text NOT NULL,
	`flag` text NOT NULL,
	`used_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_phone_number` ON `recent_contacts` (`phone_number`);--> statement-breakpoint
CREATE INDEX `idx_used_at` ON `recent_contacts` (`used_at`);--> statement-breakpoint
CREATE TABLE `broadcasts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `broadcast_contacts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`broadcast_id` integer NOT NULL,
	`phone_number` text NOT NULL,
	`country_code` text NOT NULL,
	`sent` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`broadcast_id`) REFERENCES `broadcasts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_broadcast_id` ON `broadcast_contacts` (`broadcast_id`);--> statement-breakpoint
CREATE TABLE `message_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phone_number` text NOT NULL,
	`country_code` text NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`scheduled_at` integer NOT NULL,
	`notification_id` text,
	`completed` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
