ALTER TABLE `glossary_entries` ADD `draft_term` varchar(255);--> statement-breakpoint
ALTER TABLE `glossary_entries` ADD `draft_definition` text;--> statement-breakpoint
ALTER TABLE `glossary_entries` ADD `draft_group` varchar(128);--> statement-breakpoint
ALTER TABLE `glossary_entries` ADD `is_published` boolean DEFAULT true NOT NULL;--> statement-breakpoint
UPDATE `glossary_entries`
SET `draft_term` = `term`,
    `draft_definition` = `definition`,
    `draft_group` = `group_name`
WHERE `draft_term` IS NULL OR `draft_definition` IS NULL OR `draft_group` IS NULL;
