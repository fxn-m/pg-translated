import { db } from "@/db"
import { eq, and } from "drizzle-orm"
import { essays } from "@/db/schema"
import { type SupportedLanguage, supportedLanguages } from "@/db/schema"
import Link from "next/link"

// Return a list of `params` to populate the [slug] dynamic segment
export const generateStaticParams = async () =>
  supportedLanguages.map((language) => ({
    language
  }))

export default async function Page({ params }: { params: { lang: string } }) {
  const language = params.lang

  const essayArray = await db
    .select()
    .from(essays)
    .where(and(eq(essays.language, language as SupportedLanguage), eq(essays.translationModel, "gpt-4o-mini")))

  if (essayArray.length === 0) {
    return <div>There are no essays in this language</div>
  }

  return (
    <div className="flex flex-grow flex-col pb-8">
      <main className="flex flex-col space-y-2">
        {essayArray
          .sort((a, b) => new Date(b.date_written).getTime() - new Date(a.date_written).getTime())
          .map((essay) => (
            <div key={essay.id} className="flex flex-col">
              <p>
                <Link className="text-m text-blue-600 visited:text-gray-400 hover:underline" href={`/essays/${language}/${essay.short_title}`}>
                  {essay.title}
                </Link>
              </p>
              <p className="text-sm text-gray-500">{essay.translated_title}</p>
            </div>
          ))}
      </main>
    </div>
  )
}
