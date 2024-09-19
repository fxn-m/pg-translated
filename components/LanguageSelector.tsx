"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

import { ChevronDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// https://nucleoapp.com/svg-flag-icons
const languages = [
  { code: "english", flag: "🇬🇧", translation: "English" },
  { code: "french", flag: "🇫🇷", translation: "Français" },
  { code: "spanish", flag: "🇪🇸", translation: "Español" },
  { code: "portuguese", flag: "🇧🇷", translation: "Português" },
  { code: "german", flag: "🇩🇪", translation: "Deutsch" },
  { code: "japanese", flag: "🇯🇵", translation: "日本語" },
  { code: "hindi", flag: "🇮🇳", translation: "हिन्दी" },
  { code: "chinese", flag: "🇨🇳", translation: "中文" }
]

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const params = useSearchParams()
  const isWindows = navigator.userAgent.includes("Windows")

  const [lang, shortTitle = "", model] = pathname.split("/").filter(Boolean).slice(1)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const currentLanguage = languages.find((language) => language.code === (lang || params.get("lang")))

  const imageSrc = `/flagIcons/${currentLanguage?.code || "globe"}.svg`

  return (
    <div className="inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-700"
          id="language-menu-button"
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isWindows ? <Image src={imageSrc} alt="flagIcon" width={18} height={18} /> : <div>{currentLanguage?.flag || "🌐"}</div>}
          <ChevronDown className={`-mr-1 h-5 w-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""} dark:text-gray-300`} aria-hidden="true" />
        </button>
      </div>
      {isOpen && (
        <div
          className="absolute right-4 z-10 mt-2 w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-600"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="language-menu-button"
          tabIndex={-1}
        >
          <div className="py-1" role="none">
            {languages.map((language) => (
              <Link
                key={language.code}
                href={
                  pathname === "/"
                    ? `/?lang=${language.code}`
                    : `/essays/${language.code}/${shortTitle}/${model ? (model !== "gpt-4o-mini" && language.code === "english" ? "" : model) : ""}`
                }
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                role="menuitem"
                tabIndex={-1}
                onClick={() => setIsOpen(false)}
              >
                {isWindows ? (
                  <div className="flex flex-row items-center">
                    <Image src={`/flagIcons/${language.code}.svg`} alt="flagIcon" width={16} height={16} /> &nbsp; {language.translation}
                  </div>
                ) : (
                  <div>
                    {language.flag} &nbsp; {language.translation}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
