// "use client"

// import Link from "next/link"

// export default function Navigation() {
//   return (
//     <div className="flex flex-row gap-2 sm:gap-6">
//       <Link href="/">Home</Link>
//       <Link href="/essays">Essays</Link>
//     </div>
//   )
// }

"use client"

import { usePathname, useSearchParams } from "next/navigation"

import Link from "next/link"
import { Suspense } from "react"

export default function Navigation() {
  const pathname = usePathname()
  const params = useSearchParams()

  const pathSegments = pathname.split("/")
  const lang = pathSegments.length > 2 ? pathSegments[2] : "english"

  return (
    <Suspense>
      <div className="flex flex-row gap-2 sm:gap-6">
        <Link href={`/${params.get("lang") || lang ? "?lang=" + (params.get("lang") || lang) : ""}`}>Home</Link>
        <Link href={`/essays?lang=${params.get("lang") || lang}`}>Essays</Link>
      </div>
    </Suspense>
  )
}
