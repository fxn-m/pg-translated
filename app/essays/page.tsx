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
    .where(eq(essays.language, language as SupportedLanguage)) // ! BAD: This is a hack to get the type of the enum values

  if (essayArray.length === 0) {
    return <div>There are no essays in this language</div>
  }

  return (
    <div className="flex h-full flex-grow flex-col">
      <main className="flex flex-col">
        {essayArray.map((essay) => (
          <div key={essay.id}>
            <Link className="text-blue-600 visited:text-gray-400" href={`/${essay.short_title}/${language}`}>
              {essay.title}
            </Link>
          </div>
        ))}
      </main>
    </div>
  )
}
