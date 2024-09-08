export default function Page({ params }: { params: { slug: string[] } }) {
  const [article, lang] = params.slug

  // fetch the article from the database

  return (
    <div className="min-h-screen items-center justify-items-center gap-16 p-8 pb-20 font-geistSans sm:p-20">
      <main className="row-start-2 flex flex-col items-start gap-8 sm:items-start">
        <h1 className="text-xl">{article.toLocaleUpperCase()}</h1>
        <p className="font-verdana">
          paulgraham-translated.com/{article} in {lang}
        </p>
      </main>
    </div>
  )
}
