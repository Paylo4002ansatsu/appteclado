CREATE TABLE `admin_login_rate_limits` (
	`key_hash` varchar(64) NOT NULL,
	`attempts` int NOT NULL,
	`window_started_at` datetime(3) NOT NULL,
	`window_ends_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `admin_login_rate_limits_key_hash` PRIMARY KEY(`key_hash`)
);
--> statement-breakpoint
CREATE INDEX `admin_login_rate_limits_window_idx` ON `admin_login_rate_limits` (`window_ends_at`);