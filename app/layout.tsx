import "./globals.css"

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
  description: "A collection of Paul Graham's essays, translated into multiple languages."
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html>
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
      </body>
      <Analytics />
      <SpeedInsights />
    </html>
  )
}
