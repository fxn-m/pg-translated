CREATE TABLE IF NOT EXISTS "essays" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar,
	"content" text,
	"created_at" text,
	"updated_at" text,
	"likes" integer,
	"language" varchar
);
