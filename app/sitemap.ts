import { MetadataRoute } from "next"
import { db } from "@/db"
import { eq } from "drizzle-orm"
import { essays } from "@/db/schema"
import { models } from "@/db/schema"
import { supportedLanguages } from "@/db/schema"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const essaysData = await db
      .select({
        short_title: essays.short_title,
        created_at: essays.created_at
      })
      .from(essays)
      .where(eq(essays.language, "english"))

    const sitemapEntries: MetadataRoute.Sitemap = []

    essaysData.forEach((essay) => {
      supportedLanguages.forEach((language) => {
        models.forEach((model) => {
          const encodedShortTitle = encodeURIComponent(essay.short_title)
          sitemapEntries.push({
            url: `https://paulgraham-translated.vercel.app/essays/${language}/${encodedShortTitle}/${model}`,
            lastModified: essay.created_at || new Date(),
            changeFrequency: "yearly",
            priority: 0.7
          })
        })
      })
    })

    sitemapEntries.push({
      url: `https://paulgraham-translated.vercel.app/essays`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: {
          en: "https://paulgraham-translated.vercel.app/essays/english",
          fr: "https://paulgraham-translated.vercel.app/essays/french",
          es: "https://paulgraham-translated.vercel.app/essays/spanish",
          pt: "https://paulgraham-translated.vercel.app/essays/portuguese",
          de: "https://paulgraham-translated.vercel.app/essays/german",
          ja: "https://paulgraham-translated.vercel.app/essays/japanese",
          hi: "https://paulgraham-translated.vercel.app/essays/hindi",
          zh: "https://paulgraham-translated.vercel.app/essays/chinese"
        }
      }
    })

    sitemapEntries.push({
      url: `https://paulgraham-translated.vercel.app/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
      alternates: {
        languages: {
          en: "https://paulgraham-translated.vercel.app/?lang=english",
          fr: "https://paulgraham-translated.vercel.app/?lang=french",
          es: "https://paulgraham-translated.vercel.app/?lang=spanish",
          pt: "https://paulgraham-translated.vercel.app/?lang=portuguese",
          de: "https://paulgraham-translated.vercel.app/?lang=german",
          ja: "https://paulgraham-translated.vercel.app/?lang=japanese",
          hi: "https://paulgraham-translated.vercel.app/?lang=hindi",
          zh: "https://paulgraham-translated.vercel.app/?lang=chinese"
        }
      }
    })

    return sitemapEntries
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return []
  }
}
