import { languageCodes, supportedLanguages } from "@/db/schema"

import { MetadataRoute } from "next"
import { db } from "@/db"
import { eq } from "drizzle-orm"
import { essays } from "@/db/schema"
import { models } from "@/db/schema"

function generateAlternates(basePath: string) {
  const alternates = {
    languages: {} as Record<string, string>
  }

  for (const [languageName, code] of Object.entries(languageCodes)) {
    alternates.languages[code] = `https://paulgraham-translated.vercel.app${basePath}${basePath ? "/" : "?lang="}${languageName}`
  }

  return alternates
}

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

    sitemapEntries.push({
      url: `https://paulgraham-translated.vercel.app/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0
    })

    supportedLanguages.forEach((language) => {
      sitemapEntries.push({
        url: `https://paulgraham-translated.vercel.app/?lang=${language}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.9,
        alternates: generateAlternates("")
      })
    })

    supportedLanguages.forEach((language) => {
      sitemapEntries.push({
        url: `https://paulgraham-translated.vercel.app/essays/${language}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
        alternates: generateAlternates("/essays")
      })
    })

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

    return sitemapEntries
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return []
  }
}
