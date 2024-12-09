import "./globals.css"

import { languageCodes, supportedLanguages } from "@/db/schema"

import { Analytics } from "@vercel/analytics/react"
import { Inter } from "next/font/google"
import LanguageSelector from "@/components/LanguageSelector"
import type { Metadata } from "next"
import ModelSelector from "@/components/ModelSelector"
import Navigation from "@/components/Navigation"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"
import localFont from "next/font/local"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900"
})

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900"
})

const verdana = localFont({
  src: "./fonts/Verdana.woff",
  variable: "--font-verdana",
  weight: "variable"
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
})

export const metadata: Metadata = {
  title: "Paul Graham's Essays - Translated",
  description: "All of Paul Graham's essays, translated into multiple languages.",
  creator: "fxn-m",
  openGraph: {
    title: "Paul Graham's Essays - Translated",
    description: "Paul Graham's essays, translated into multiple languages.",
    type: "website",
    url: "https://paulgraham-translated.vercel.app/",
    siteName: "Paul Graham's Essays - Translated",
    images: [
      {
        url: "https://paulgraham-translated.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Paul Graham's Essays - Translated"
      }
    ]
  },
  twitter: {
    title: "Paul Graham's Essays - Translated",
    description: "Paul Graham's essays, translated into multiple languages.",
    card: "summary_large_image",
    images: [
      {
        url: "https://paulgraham-translated.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Paul Graham's Essays - Translated"
      }
    ]
  },
  verification: { google: "Jyvg74NWOsKSbfvRJSDfH08HfQp-34IgOoL4823oQFM" },
  alternates: {
    canonical: "https://paulgraham-translated.vercel.app/",
    languages: supportedLanguages.reduce<Record<string, string>>((acc, lang) => {
      const langCode = languageCodes[lang as keyof typeof languageCodes]

      if (langCode) {
        acc[langCode] = `https://paulgraham-translated.vercel.app/?lang=${lang}`
      }

      return acc
    }, {})
  },
  keywords: [
    "Paul Graham Essays Translation",
    "Paul Graham Essays Translated",
    "Paul Graham Essays in Multiple Languages",
    "Read Paul Graham Essays Translated",
    "Paul Graham Essay Collection Translated",
    "Translate Paul Graham Essays",
    "Access Paul Graham Essays in Multiple Languages",
    "Essays Translated into Multiple Languages"
  ]
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${verdana.variable} ${inter.variable} flex h-dvh flex-col p-4 antialiased sm:h-screen sm:p-8`}
      >
        <div className="mb-6 flex min-h-16 flex-row items-center justify-between gap-y-4 sm:min-h-16">
          <Suspense>
            <Navigation />
          </Suspense>

          <div className="ml-auto flex flex-row flex-wrap-reverse justify-end gap-2 sm:gap-6">
            <Suspense fallback={<div>Loading...</div>}>
              <ModelSelector />
              <LanguageSelector />
            </Suspense>
          </div>
        </div>
        <Suspense>{children}</Suspense>
        <Toaster />
        <SpeedInsights />
      </body>
      <Analytics />
    </html>
  )
}
