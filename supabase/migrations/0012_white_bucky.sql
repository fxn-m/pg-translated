ALTER TYPE "language_enum" ADD VALUE 'chinese';--> statement-breakpoint
ALTER TYPE "language_enum" ADD VALUE 'portuguese';--> statement-breakpoint
ALTER TABLE "essays" ALTER COLUMN "translation_model" DROP DEFAULT;