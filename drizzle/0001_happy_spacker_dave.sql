ALTER TABLE "post" DROP CONSTRAINT "post_group_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "post" DROP COLUMN IF EXISTS "group_id";