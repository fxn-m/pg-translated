DO $$ BEGIN
 CREATE TYPE "public"."language_enum" AS ENUM('English', 'French', 'Spanish', 'German');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "essays" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"content" text,
	"created_at" timestamp DEFAULT now(),
	"likes" integer,
	"language" "language_enum"
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_idx" ON "essays" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "language_idx" ON "essays" USING btree ("language");