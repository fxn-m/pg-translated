import { MetadataRoute } from "next"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const sitemapEntries: MetadataRoute.Sitemap = []

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
