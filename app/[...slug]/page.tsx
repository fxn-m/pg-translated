import { db } from "@/db"
import { eq } from "drizzle-orm"
import { essays } from "@/db/schema"
import html from "remark-html"
import { remark } from "remark"

export default async function Page({ params }: { params: { slug: string[] } }) {
  const [rawArticleTitle, lang] = params.slug

  const articleTitle = rawArticleTitle.replace(/%20/g, " ")
  const article = await db.select().from(essays).where(eq(essays.title, articleTitle))

  const content = article[0].content
  const parsedContent = await remark().use(html).process(content)
  const contentHtml = parsedContent.toString()

  return (
    <div className="min-h-screen items-center justify-items-center gap-16 p-8 pb-20 font-geistSans sm:p-20">
      <main className="row-start-2 flex flex-col items-start gap-8 sm:items-start">
        <h1 className="text-xl">{articleTitle.toLocaleUpperCase()}</h1>
        <p>
          paulgraham-translated.com/{articleTitle} in {lang}
        </p>
        <div className="w-1/3 space-y-4 font-verdana" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </main>
    </div>
  )
}
