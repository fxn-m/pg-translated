export default function Home() {
  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <h1>paulgraham-translated.com</h1>
      </main>

      <footer className="row-start-3 flex flex-wrap items-center justify-center gap-6">
        <span>
          A{" "}
          <a href="https://fxn-m.com" target="_blank">
            fxn-m
          </a>{" "}
          production.
        </span>
      </footer>
    </div>
  )
}
