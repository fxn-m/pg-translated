import { integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core"

export const essays = pgTable("essays", {
  id: serial("id").primaryKey(),
  title: varchar("title"),
  content: text("content"),
  created_at: text("created_at"),
  updated_at: text("updated_at"),
  likes: integer("likes"),
  language: varchar("language")
})
