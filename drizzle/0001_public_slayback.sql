ALTER TABLE "post" RENAME COLUMN "title" TO "header";--> statement-breakpoint
ALTER TABLE "post" DROP COLUMN "is_count_down";--> statement-breakpoint
ALTER TABLE "post" DROP COLUMN "count_down_date";