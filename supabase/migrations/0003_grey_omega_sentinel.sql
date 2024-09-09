ALTER TABLE "essays" ALTER COLUMN "likes" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "essays" ADD COLUMN "date_written" timestamp;--> statement-breakpoint
ALTER TABLE "essays" ADD COLUMN "translation_model" varchar DEFAULT 'gpt-4o-mini';