import { date, index, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core"

export const languageEnum = pgEnum("language_enum", ["english", "french", "spanish", "german"])
export const supportedLanguages = languageEnum.enumValues
export type SupportedLanguage = (typeof supportedLanguages)[number] // ! BAD: This is a hack to get the type of the enum values

export const essays = pgTable(
  "essays",
  {
    id: serial("id").primaryKey(),
    title: varchar("title").notNull(),
    short_title: varchar("short_title").notNull(),
    content: text("content").notNull(),
    date_written: date("date_written").notNull(),
    language: languageEnum("language").notNull(),
    translationModel: varchar("translation_model").default("gpt-4o-mini"),
    created_at: timestamp("created_at").defaultNow(),
    likes: integer("likes").default(0)
  },
  (table) => {
    return {
      createdAtIndex: index("created_at_idx").on(table.created_at), // Index for created_at
      languageIndex: index("language_idx").on(table.language) // Index for faster querying by language
    }
  }
)
