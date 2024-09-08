export default function Page({ params }: { params: { slug: string[] } }) {
  const [article, lang] = params.slug

  // fetch the article from the database

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <article className="">
          <h1 className="text-xl">{article.toLocaleUpperCase()}</h1>
          <p className="">
            paulgraham-translated.com/{article} in {lang}
          </p>
        </article>
      </main>
    </div>
  )
}
