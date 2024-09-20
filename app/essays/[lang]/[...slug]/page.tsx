import { and, eq, isNull } from "drizzle-orm"
import { essays, languageCodes, supportedLanguages } from "@/db/schema"

import { ArrowUpRight } from "lucide-react"
import Error from "@/app/error"
import Feedback from "./Feedback"
import Link from "next/link"
import { Metadata } from "next"
import { capitalise } from "@/lib/utils"
import { db } from "@/db"
import gfm from "remark-gfm"
import { isSupportedLanguage } from "@/db/schema"
import { languageData } from "@/lib/languageData"
import { notFound } from "next/navigation"
import rehypeRaw from "rehype-raw"
import rehypeStringify from "rehype-stringify"
import { remark } from "remark"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"

export async function generateMetadata({ params }: { params: { lang: string; slug: string[] } }): Promise<Metadata> {
  const [rawShortTitle, model = "google-NMT"] = params.slug

  if (!isSupportedLanguage(params.lang)) {
    return {
      title: "500 - Invalid Language",
      description: "The language you have selected is not supported"
    }
  }

  const languageName = capitalise(languageData[params.lang].name)
  const essayTitle = capitalise(rawShortTitle)
  const modelName = capitalise(model.replace("-", " "))

  const keywords = [
    `${essayTitle} in ${languageName}`,
    `${essayTitle} - ${languageName}`,
    `${essayTitle} - ${languageName} - ${modelName}`,
    `Paul Graham's ${essayTitle}`,
    `Paul Graham Essays - ${languageName} `,
    `Paul Graham's ${essayTitle} Translation`,
    `Translated ${essayTitle} by Paul Graham`,
    `${languageName} Translation of ${essayTitle}`,
    `Paul Graham's Essays in ${languageName}`,
    `AI Translation - ${essayTitle} by Paul Graham`
  ]

  return {
    title: `${essayTitle} - ${languageName}`,
    description: `Read Paul Graham's ${essayTitle} translated into ${languageName} with ${modelName}. Explore insightful essays with high-quality translations.`,
    authors: [{ name: "Paul Graham", url: "https://paulgraham.com" }],
    creator: "fxn-m",
    alternates: {
      canonical: `https://paulgraham-translated.vercel.app/essays/${params.lang}/${rawShortTitle}/google-NMT`,
      languages: supportedLanguages.reduce<Record<string, string>>((acc, lang) => {
        const langCode = languageCodes[lang as keyof typeof languageCodes]

        if (langCode) {
          acc[langCode] = `https://paulgraham-translated.vercel.app/essays/${lang}/${rawShortTitle}/${model}`
        }

        return acc
      }, {})
    },
    keywords
  }
}

function ExternalLinkComponent({ short_title }: { short_title: string }) {
  return (
    <Link
      href={`https://paulgraham.com/${short_title}.html`}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative inline-flex items-center text-blue-600 decoration-transparent transition-colors hover:text-blue-400 hover:decoration-transparent"
    >
      Original
      <ArrowUpRight className="h-3 w-3 text-blue-600 transition-colors group-hover:text-blue-400" aria-hidden="true" />
    </Link>
  )
}

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
  const essayPermutations = await db
    .select({
      short_title: essays.short_title,
      language: essays.language,
      translation_model: essays.translation_model
    })
    .from(essays)

  return essayPermutations.map((essay) => ({
    shortTitle: essay.short_title,
    lang: essay.language,
    model: essay.translation_model
  }))
}

export default async function Page({ params }: { params: { lang: string; slug: string[] } }) {
  const { lang, slug } = params
  const [rawShortTitle, model = "google-NMT"] = slug

  const language = lang.toLowerCase()

  if (!isSupportedLanguage(language)) {
    return <Error message="Invalid language" />
  }

  const shortTitle = rawShortTitle.replace(/%20/g, " ")

  const [essay] = await db
    .select({
      id: essays.id,
      short_title: essays.short_title,
      translated_title: essays.translated_title,
      content: essays.content
    })
    .from(essays)
    .where(
      and(
        language === "english" ? isNull(essays.translation_model) : eq(essays.translation_model, model),
        eq(essays.short_title, shortTitle),
        eq(essays.language, language)
      )
    )
  if (!essay) {
    notFound()
  }

  const parsedContent = await remark()
    .use(gfm)
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(essay.content)
  const contentHtml = parsedContent.toString()

  return (
    <div className="items-center justify-items-center pb-8 font-geistSans">
      <main className="row-start-2 space-y-4 text-sm sm:items-start">
        <div className="flex w-full flex-row justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-xl">{essay.translated_title.toUpperCase()}</h1>
            <ExternalLinkComponent short_title={essay.short_title} />
          </div>
          {lang !== "english" && <Feedback essayId={essay.id} />}
        </div>
        <div className="max-w-2xl space-y-4 font-verdana md:w-2/3 lg:w-1/2" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </main>
    </div>
  )
}
