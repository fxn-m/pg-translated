import { db } from "@/db"
import { eq } from "drizzle-orm"
import { essays } from "@/db/schema"
import { type SupportedLanguage } from "@/db/schema"
import Link from "next/link"

export default async function Page({ searchParams }: { searchParams: Record<string, string> }) {
  const language = searchParams["lang"] || "english"

  const essayArray = await db
    .select()
    .from(essays)
    .where(eq(essays.language, language as SupportedLanguage))

  if (essayArray.length === 0) {
    return <div>There are no essays in this language</div>
  }

  return (
    <div className="flex h-full flex-grow flex-col">
      <main className="flex flex-col space-y-2">
        {essayArray
          .sort((a, b) => new Date(b.date_written).getTime() - new Date(a.date_written).getTime())
          .map((essay) => (
            <div key={essay.id} className="flex flex-col">
              <p>
                <Link className="text-m text-blue-600 visited:text-gray-400 hover:underline" href={`/${essay.short_title}/${language}`}>
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
