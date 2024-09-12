"use client"

import Link from "next/link"
import { Suspense } from "react"
import { Typewriter } from "react-simple-typewriter"
import { useSearchParams } from "next/navigation"

const languageData: Record<string, { translation: string; flag: string }> = {
  english: { translation: "essays", flag: "🇬🇧" },
  french: { translation: "essais", flag: "🇫🇷" },
  spanish: { translation: "ensayos", flag: "🇪🇸" },
  italian: { translation: "saggi", flag: "🇮🇹" },
  german: { translation: "aufsätze", flag: "🇩🇪" }
}

const languages = Object.keys(languageData)
const translations = [...languages.map((lang) => languageData[lang].translation), "essays - translated"]

const ElevatedFlag = ({ language }: { language: string }) => (
  <div className="inline-flex h-12 w-12 cursor-default items-center justify-center rounded-full text-xl shadow-md transition-shadow duration-300 hover:shadow-lg dark:bg-slate-800">
    {languageData[language].flag}
  </div>
)

export default function Home() {
  const searchParams = useSearchParams()
  const language = searchParams.get("lang")
  const isValidLanguage = language && languages.includes(language)

  return (
    <Suspense>
      <div className="flex flex-grow flex-col items-center justify-between">
        <Suspense>
          <div className="flex flex-grow flex-col items-center justify-center">
            <h1 className="mb-4 flex flex-wrap items-center font-mono text-2xl font-bold">
              <span>Paul Graham&apos;s&nbsp;</span>
              <span className="relative font-mono text-blue-600">
                {isValidLanguage ? (
                  <Link href={`/essays/${language}`}>{languageData[language].translation}</Link>
                ) : (
                  <Typewriter words={translations} loop={1} typeSpeed={100} deleteSpeed={50} delaySpeed={2000} />
                )}
              </span>
            </h1>
            {isValidLanguage && <ElevatedFlag language={language} />}
          </div>
        </Suspense>
        <footer className="mt-8 max-w-2xl text-xs text-gray-500">
          <p className="mb-4">
            None of the content on this website is my own. All essays are written by Paul Graham and are reproduced here for educational and informational
            purposes. This site is intended to make his essays more accessible to a wider audience by offering translations into multiple languages. I do not
            claim any ownership or rights over the original works.
          </p>
          <p>
            For the official source of these brilliant essays, please visit{" "}
            <a className="text-sky-700 hover:underline" href="https://paulgraham.com" target="_blank" rel="noopener noreferrer">
              paulgraham.com
            </a>
            .
          </p>
        </footer>
      </div>
    </Suspense>
  )
}
