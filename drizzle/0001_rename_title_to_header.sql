-- Rename title column to header
ALTER TABLE "post" RENAME COLUMN "title" TO "header";
--> statement-breakpoint
-- Drop is_count_down column
ALTER TABLE "post" DROP COLUMN IF EXISTS "is_count_down";
--> statement-breakpoint
-- Drop count_down_date column
ALTER TABLE "post" DROP COLUMN IF EXISTS "count_down_date";
