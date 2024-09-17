import { db } from "@/db"
import { eq, and, isNull } from "drizzle-orm"
import { essays } from "@/db/schema"
import { type SupportedLanguage, supportedLanguages } from "@/db/schema"
import Link from "next/link"
import Error from "@/app/error"

// Return a list of `params` to populate the [slug] dynamic segment
export const generateStaticParams = async () =>
  supportedLanguages.map((language) => ({
    language
  }))

export default async function Page({ params }: { params: { lang: string } }) {
  const language = params.lang

  if (!supportedLanguages.includes(language as SupportedLanguage)) {
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

  console.log(essayArray)

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
      <main className={`flex flex-col space-y-${language === "english" ? "1" : "4"}`}>
        {years.map((year) => (
          <div key={year}>
            {year != "1969" && (
              <h2 className="sm:text-md min-w-md mb-2 mt-4 max-w-xl border-b border-b-slate-200 pb-1 text-sm font-bold text-stone-600 dark:border-b-slate-600 dark:text-stone-400">
                {year}
              </h2>
            )}
            <div className="flex flex-col space-y-2">
              {essaysByYear[year]
                .sort((a, b) => new Date(b.date_written).getTime() - new Date(a.date_written).getTime())
                .map((essay) => (
                  <div key={essay.id} className="flex flex-col">
                    <p>
                      <Link
                        className={`text-md text-blue-600 visited:text-gray-400 hover:underline sm:${language === "english" ? "text-md" : "text-lg"} dark:text-blue-500`}
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
