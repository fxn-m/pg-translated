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
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { notFound } from "next/navigation"
import Error from "@/app/error"
import Feedback from "./Feedback"

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
  const essayPermutations = await db.select().from(essays)

  return essayPermutations.map((essay) => ({
    shortTitle: essay.short_title,
    lang: essay.language,
    model: essay.translationModel
  }))
}

export default async function Page({ params }: { params: { lang: string; slug: string[] } }) {
  const { lang, slug } = params
  const [rawShortTitle, model = "gpt-4o-mini"] = slug

  const language = lang.toLowerCase() as SupportedLanguage // ! BAD: This is a hack to get the type of the enum values

  if (!supportedLanguages.includes(language)) {
    return <Error message="Invalid language" reset={() => {}} />
  }

  const shortTitle = rawShortTitle.replace(/%20/g, " ")
  const [essay] = await db
    .select()
    .from(essays)
    .where(and(eq(essays.translationModel, model), and(eq(essays.short_title, shortTitle), eq(essays.language, language))))

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
      <main className="row-start-2 space-y-8 text-sm sm:items-start">
        <div className="flex w-full flex-row">
          <div className="flex flex-grow flex-col gap-4">
            <h1 className="text-xl">{essay.title.toUpperCase()}</h1>
            <ExternalLinkComponent short_title={essay.short_title} />
          </div>
          {lang !== "english" && <Feedback essayId={essay.id} />}
        </div>
        <div className="max-w-2xl space-y-4 font-verdana md:w-2/3 lg:w-1/2" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </main>
    </div>
  )
}
