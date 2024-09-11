"use client"

import { usePathname, useSearchParams } from "next/navigation"

import Link from "next/link"
import { Suspense } from "react"

// 1. Underline Effect
const UnderlineNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname()
  const isActive = pathname === href.split("?")[0]

  return (
    <Link
      href={href}
      className={`relative px-2 py-1 text-gray-700 transition-colors duration-200 ${isActive ? "text-blue-600" : "hover:text-blue-500"} after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-bottom-right after:scale-x-0 after:bg-blue-500 after:transition-transform after:duration-300 after:ease-out ${isActive ? "after:origin-bottom-left after:scale-x-100" : "hover:after:origin-bottom-left hover:after:scale-x-100"}`}
    >
      {children}
    </Link>
  )
}

// 2. Subtle Background
const SubtleNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname()
  const isActive = pathname === href.split("?")[0]

  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
    >
      {children}
    </Link>
  )
}

// 3. Bordered
const BorderedNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname()
  const isActive = pathname === href.split("?")[0]

  return (
    <Link
      href={href}
      className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
        isActive ? "border-b-2 border-blue-500 text-blue-700" : "border-b-2 border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  )
}

// 4. Pill Style
const PillNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname()
  const isActive = pathname === href.split("?")[0]

  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
        isActive ? "bg-blue-500 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {children}
    </Link>
  )
}

// 5. Minimalist
const MinimalistNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname()
  const isActive = pathname === href.split("?")[0]

  return (
    <Link
      href={href}
      className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-500"}`}
    >
      {children}
    </Link>
  )
}

const navLinkComponents = {
  1: UnderlineNavLink,
  2: SubtleNavLink,
  3: BorderedNavLink,
  4: PillNavLink,
  5: MinimalistNavLink
}

const NavigationLinks = ({ version, currentLang }: { version: 1 | 2 | 3 | 4 | 5; currentLang: string }) => {
  const NavLink = navLinkComponents[version]
  return (
    <>
      <NavLink href={`/${currentLang ? "?lang=" + currentLang : ""}`}>Home</NavLink>
      <NavLink href={`/essays?lang=${currentLang}`}>Essays</NavLink>
    </>
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
        <NavigationLinks version={5} currentLang={currentLang} />
      </nav>
    </Suspense>
  )
}
