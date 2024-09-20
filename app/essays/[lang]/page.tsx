import { db } from "@/db"
import { eq, and, isNull } from "drizzle-orm"
import { essays, isSupportedLanguage } from "@/db/schema"
import { type SupportedLanguage, supportedLanguages } from "@/db/schema"
import Link from "next/link"
import Error from "@/app/error"
import { capitalise } from "@/lib/utils"
import { languageData } from "@/lib/languageData"

export async function generateMetadata({ params }: { params: { lang: string } }) {
  if (!isSupportedLanguage(params.lang)) {
    return {
      title: "500 - Invalid Language",
      description: "The language you have selected is not supported"
    }
  }
  const languageName = capitalise(languageData[params.lang].name)
  const essaysTranslation = languageData[params.lang].translation
  return {
    title: `Paul Graham's ${capitalise(essaysTranslation)} - ${languageName}`,
    description: `A collection of Paul Graham's ${essaysTranslation} in ${languageName}`
  }
}

// Return a list of `params` to populate the [slug] dynamic segment
export const generateStaticParams = async () =>
  supportedLanguages.map((language) => ({
    language
  }))

export default async function Page({ params }: { params: { lang: string } }) {
  const language = params.lang

  if (!isSupportedLanguage(language)) {
    return <Error message="Invalid language" />
  }

  const essayArray = await db
    .select({
      id: essays.id,
      title: essays.title,
      short_title: essays.short_title,
      translated_title: essays.translated_title,
      date_written: essays.date_written
    })
    .from(essays)
    .where(
      and(
        eq(essays.language, language as SupportedLanguage),
        language === "english" ? isNull(essays.translation_model) : eq(essays.translation_model, "google-NMT")
      )
    )

  if (essayArray.length === 0) {
    return <div>There are no essays in this language</div>
  }

  const essaysByYear = essayArray.reduce(
    (acc, essay) => {
      const year = new Date(essay.date_written).getFullYear()
      if (!acc[year]) {
        acc[year] = []
      }
      acc[year].push(essay)
      return acc
    },
    {} as Record<string, typeof essayArray>
  )

  const years = Object.keys(essaysByYear).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="flex flex-grow flex-col pb-8">
      <main className={`flex flex-col`}>
        {years.map((year) => (
          <div key={year}>
            {year != "1969" && (
              <h2 className="sm:text-md min-w-md mb-2 mt-4 max-w-xl border-b border-b-slate-200 pb-1 text-sm font-bold text-stone-600 dark:border-b-slate-600 dark:text-stone-400">
                {year}
              </h2>
            )}
            <div className={`flex flex-col space-y-${language === "english" ? "1" : "2"}`}>
              {essaysByYear[year]
                .sort((a, b) => new Date(b.date_written).getTime() - new Date(a.date_written).getTime())
                .map((essay) => (
                  <div key={essay.id} className={`flex flex-col`}>
                    <p className={`text-md`}>
                      <Link
                        className={`text-blue-600 visited:text-gray-400 hover:underline dark:text-blue-500`}
                        href={`/essays/${language}/${essay.short_title}`}
                      >
                        {essay.translated_title}
                      </Link>
                    </p>
                    {language !== "english" && <p className="text-sm text-gray-500">{essay.title}</p>}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
