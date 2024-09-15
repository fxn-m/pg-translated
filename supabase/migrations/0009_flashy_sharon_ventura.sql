CREATE TABLE IF NOT EXISTS "feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"essay_id" integer NOT NULL,
	"feedback_type" varchar NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feedback" ADD CONSTRAINT "feedback_essay_id_essays_id_fk" FOREIGN KEY ("essay_id") REFERENCES "public"."essays"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "essays" DROP COLUMN IF EXISTS "likes";--> statement-breakpoint
ALTER TABLE "essays" DROP COLUMN IF EXISTS "dislikes";--> statement-breakpoint
ALTER TABLE "essays" DROP COLUMN IF EXISTS "errors";