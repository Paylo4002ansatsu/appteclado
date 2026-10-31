CREATE TABLE IF NOT EXISTS `admin_sessions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`csrf_token_hash` varchar(64) NOT NULL,
	`expires_at` datetime(3) NOT NULL,
	`revoked_at` datetime(3),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `admin_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_sessions_token_hash_uq` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `admin_users` (
	`id` varchar(36) NOT NULL,
	`email` varchar(320) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_users_email_uq` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `content_migrations` (
	`key_name` varchar(191) NOT NULL,
	`applied_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`metadata` json,
	CONSTRAINT `content_migrations_key_name` PRIMARY KEY(`key_name`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `glossary_entries` (
	`id` varchar(96) NOT NULL,
	`term` varchar(255) NOT NULL,
	`definition` text NOT NULL,
	`group_name` varchar(128) NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `glossary_entries_id` PRIMARY KEY(`id`),
	CONSTRAINT `glossary_term_uq` UNIQUE(`term`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `levels` (
	`id` varchar(64) NOT NULL,
	`number` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`subtitle` text NOT NULL,
	`color` varchar(32) NOT NULL,
	`sort_order` int NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `levels_id` PRIMARY KEY(`id`),
	CONSTRAINT `levels_number_uq` UNIQUE(`number`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `modules` (
	`id` varchar(96) NOT NULL,
	`number` int NOT NULL,
	`level_id` varchar(64) NOT NULL,
	`sort_order` int NOT NULL,
	`readiness` enum('ready','planned') NOT NULL DEFAULT 'planned',
	`is_published` boolean NOT NULL DEFAULT false,
	`draft_content` json NOT NULL,
	`published_content` json,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `modules_id` PRIMARY KEY(`id`),
	CONSTRAINT `modules_global_number_uq` UNIQUE(`number`)
);
--> statement-breakpoint
ALTER TABLE `admin_sessions` ADD CONSTRAINT `admin_sessions_user_id_admin_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `admin_users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `modules` ADD CONSTRAINT `modules_level_id_levels_id_fk` FOREIGN KEY (`level_id`) REFERENCES `levels`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `admin_sessions_user_expiry_idx` ON `admin_sessions` (`user_id`,`expires_at`);--> statement-breakpoint
CREATE INDEX `modules_level_order_idx` ON `modules` (`level_id`,`sort_order`);
