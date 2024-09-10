import { and, eq } from "drizzle-orm"

import { db } from "@/db"
import { essays } from "@/db/schema"
import gfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeStringify from "rehype-stringify"
import { remark } from "remark"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { type SupportedLanguage, supportedLanguages } from "@/db/schema"

export default async function Page({ params }: { params: { slug: string[] } }) {
  const [rawShortTitle, lang, model = "gpt-4o-mini"] = params.slug

  const language = lang.toLowerCase() as SupportedLanguage // ! BAD: This is a hack to get the type of the enum values

  if (!supportedLanguages.includes(language)) {
    return <div>Invalid language</div>
  }

  const shortTitle = rawShortTitle.replace(/%20/g, " ")
  const [essay] = await db
    .select()
    .from(essays)
    .where(and(eq(essays.translationModel, model), and(eq(essays.short_title, shortTitle), eq(essays.language, language))))

  const parsedContent = await remark()
    .use(gfm)
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(essay.content)
  const contentHtml = parsedContent.toString()

  return (
    <div className="min-h-screen items-center justify-items-center font-geistSans">
      <main className="row-start-2 flex flex-col items-start gap-8 text-sm sm:items-start">
        <h1 className="text-xl">{essay.title.toUpperCase()}</h1>
        <div className="max-w-2xl space-y-4 font-verdana md:w-2/3 lg:w-1/2" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </main>
    </div>
  )
}
