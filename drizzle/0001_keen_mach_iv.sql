ALTER TABLE `modules` ADD `published_metadata` json;

--> statement-breakpoint
UPDATE `modules`
SET `published_metadata` = JSON_OBJECT(
  'levelId', `level_id`,
  'number', `number`,
  'sortOrder', `sort_order`,
  'readiness', `readiness`
)
WHERE `is_published` = 1
  AND `published_content` IS NOT NULL
  AND `published_metadata` IS NULL;
