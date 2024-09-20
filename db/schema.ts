import { date, index, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core"

export const supportedLanguages = ["english", "french", "spanish", "german", "portuguese", "japanese", "hindi", "chinese"] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]
export const isSupportedLanguage = (lang: string): lang is SupportedLanguage => supportedLanguages.some((supportedLang) => supportedLang === lang)
const languageEnum = pgEnum("language_enum", supportedLanguages)
export const languageCodes: Record<SupportedLanguage, string> = {
  english: "en",
  french: "fr",
  spanish: "es",
  german: "de",
  portuguese: "pt",
  japanese: "ja",
  hindi: "hi",
  chinese: "zh"
}

export const essays = pgTable(
  "essays",
  {
    id: serial("id").primaryKey(),
    title: varchar("title").notNull(),
    short_title: varchar("short_title").notNull(),
    translated_title: varchar("translated_title").notNull(),
    content: text("content").notNull(),
    date_written: date("date_written").notNull(),
    language: languageEnum("language").notNull(),
    translation_model: varchar("translation_model"),
    created_at: timestamp("created_at").defaultNow()
  },
  (table) => {
    return {
      createdAtIndex: index("created_at_idx").on(table.created_at), // Index for created_at
      languageIndex: index("language_idx").on(table.language) // Index for faster querying by language
    }
  }
)

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  essay_id: integer("essay_id")
    .references(() => essays.id)
    .notNull(),
  feedback_type: varchar("feedback_type").notNull(),
  content: text("content"),
  created_at: timestamp("created_at").defaultNow()
})
