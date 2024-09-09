import { index, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core"

export const languageEnum = pgEnum("language_enum", ["english", "french", "spanish", "german"])
export const supportedLanguages = languageEnum.enumValues

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
