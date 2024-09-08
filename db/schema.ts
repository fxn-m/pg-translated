import { index, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core"

// Enum for supported languages
export const languageEnum = pgEnum("language_enum", ["English", "French", "Spanish", "German"])

// The essays table with language enum
export const essays = pgTable(
  "essays",
  {
    id: serial("id").primaryKey(),
    title: varchar("title").notNull(),
    content: text("content").notNull(),
    created_at: timestamp("created_at").defaultNow(),
    likes: integer("likes"),
    language: languageEnum("language").notNull()
  },
  (table) => {
    return {
      createdAtIndex: index("created_at_idx").on(table.created_at), // Index for created_at
      languageIndex: index("language_idx").on(table.language) // Index for faster querying by language
    }
  }
)
