"use client"

import { useEffect, useRef, useState } from "react"

import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSearchParams } from "next/navigation"

const models = ["gpt-4o-mini"]

export default function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [essayTitle, lang, model] = pathname.split("/").filter(Boolean)
  const currentLang = lang || searchParams.get("lang") || "english"

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

  if ((!lang && essayTitle !== "essays") || !essayTitle) {
    return null
  }

  return (
    <div className="inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          id="language-menu-button"
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={() => setIsOpen(!isOpen)}
        >
          {model || "gpt-4o-mini"}
          <ChevronDown className={`-mr-1 h-5 w-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      </div>
      {isOpen && (
        <div
          className="absolute right-4 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="language-menu-button"
          tabIndex={-1}
        >
          <div className="py-1" role="none">
            {models.map((model) => (
              <Link
                key={model}
                href={`/${essayTitle}/${currentLang}/${model}`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                tabIndex={-1}
                onClick={() => setIsOpen(false)}
              >
                {model}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}