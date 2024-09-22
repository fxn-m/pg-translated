"use client"

import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { Typewriter } from "react-simple-typewriter"
import { languageData } from "@/lib/languageData"
import { useSearchParams } from "next/navigation"

const LanguageIndicator = ({ language }: { language: keyof typeof languageData }) => (
  <div className="text-lg">
    <span className="text-gray-400">[</span>
    <span className="font-medium">{languageData[language].name}</span>
    <span className="ml-1 text-sm text-gray-500">{languageData[language].code}</span>
    <span className="text-gray-400">]</span>
  </div>
)

const languages = Object.keys(languageData)
const translations = [...languages.map((lang) => languageData[lang].translation), "Essays - Translated"]

export default function Home() {
  const searchParams = useSearchParams()
  const language = searchParams.get("lang")
  const isValidLanguage = language && languages.includes(language)

  return (
    <Suspense>
      <div className="flex flex-grow flex-col items-center justify-between">
        <Suspense>
          <div className="flex flex-grow flex-col items-center justify-center">
            <h1 className="mb-4 flex flex-wrap items-center justify-center font-mono text-2xl font-bold">
              Paul Graham&apos;s&nbsp;
              <span className="relative font-mono text-blue-600">
                {isValidLanguage ? (
                  <Link className="hover:underline" href={`/essays/${language}`}>
                    {languageData[language].translation}
                  </Link>
                ) : (
                  <Typewriter words={translations} loop={1} typeSpeed={100} deleteSpeed={50} delaySpeed={2000} />
                )}
              </span>
            </h1>
            {isValidLanguage && <LanguageIndicator language={language} />}
          </div>
        </Suspense>

        <Link
          href="https://www.producthunt.com/posts/paul-graham-translated?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-paul&#0045;graham&#0045;translated"
          target="_blank"
          className="flex w-full justify-center md:absolute md:bottom-4 md:right-4 md:w-auto"
        >
          <Image
            className="dark:invert"
            src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=491133&theme=light`}
            alt="Paul&#0032;Graham&#0032;Translated - 223&#0032;Essays&#0032;&#0045;&#0032;8&#0032;Languages&#0032;&#0045;&#0032;4&#0032;Translations | Product Hunt"
            width={`${Math.round(250 / 1.2)}`}
            height={`${Math.round(54 / 1.2)}`}
            unoptimized
          />
        </Link>

        <footer className="mt-8 max-w-2xl text-xs text-gray-500">
          <p className="mb-4">
            None of the content on this website is my own. All essays are written by Paul Graham and are reproduced here for educational and informational
            purposes. This site is intended to make his essays more accessible to a wider audience by offering translations into multiple languages. I do not
            claim any ownership or rights over the original works.
          </p>
          <p>
            For the official source of these brilliant essays, please visit{" "}
            <Link className="text-blue-600 hover:underline" href="https://paulgraham.com" target="_blank" rel="noopener noreferrer">
              paulgraham.com
            </Link>
            .
          </p>
        </footer>
      </div>
    </Suspense>
  )
}
