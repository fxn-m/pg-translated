import { and, eq } from "drizzle-orm"

import { db } from "@/db"
import { essays } from "@/db/schema"
import gfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeStringify from "rehype-stringify"
import { remark } from "remark"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { supportedLanguages } from "@/db/schema"

// ! Bad
type SupportedLanguage = (typeof supportedLanguages)[number]

export default async function Page({ params }: { params: { slug: string[] } }) {
  const [rawArticleTitle, lang] = params.slug

  const language = lang.toLowerCase()
  if (!supportedLanguages.includes(language as SupportedLanguage)) {
    return <div>Invalid language</div>
  }

  const articleTitle = rawArticleTitle.replace(/%20/g, " ")
  const article = await db
    .select()
    .from(essays)
    .where(and(eq(essays.title, articleTitle), eq(essays.language, language as SupportedLanguage)))

  const parsedContent = await remark()
    .use(gfm)
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(article[0].content)
  const contentHtml = parsedContent.toString()

  return (
    <div className="min-h-screen items-center justify-items-center gap-16 px-20 font-geistSans">
      <main className="row-start-2 flex flex-col items-start gap-8 text-sm sm:items-start">
        <h1 className="text-xl">{articleTitle.toLocaleUpperCase()}</h1>
        <div className="max-w-2xl space-y-4 font-verdana md:w-2/3 lg:w-1/2" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </main>
    </div>
  )
}
