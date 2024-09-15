"use client"

import { usePathname, useSearchParams } from "next/navigation"

import Link from "next/link"
import { Suspense } from "react"

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname()
  const isActive = pathname === href.split("?")[0]

  return (
    <Link
      href={href}
      className={
        `rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 sm:rounded-none sm:px-0 sm:py-4 sm:pr-2 ${isActive ? "bg-blue-500 text-white shadow-md sm:bg-transparent sm:text-blue-600 sm:shadow-none" : "bg-gray-100 text-gray-700 hover:bg-gray-200 sm:bg-transparent sm:text-gray-600 sm:hover:bg-transparent sm:hover:text-blue-500 dark:bg-gray-700 dark:text-slate-200 sm:dark:bg-transparent sm:dark:text-slate-500"}` ||
        `font-medium transition-colors duration-200 ${isActive ? "" : ""}`
      }
    >
      {children}
    </Link>
  )
}

export default function Navigation() {
  const pathname = usePathname()
  const params = useSearchParams()

  const pathSegments = pathname.split("/")
  const lang = pathSegments.length > 2 ? pathSegments[2] : "english"
  const currentLang = params.get("lang") || lang

  return (
    <Suspense>
      <nav className="flex flex-row items-center space-x-2">
        <NavLink href={`/${currentLang ? "?lang=" + currentLang : ""}`}>Home</NavLink>
        <NavLink href={`/essays/${currentLang}`}>Essays</NavLink>
      </nav>
    </Suspense>
  )
}
