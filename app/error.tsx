"use client"

import { Home, RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import Link from "next/link"

type ErrorProps = {
  message: string
  reset?: () => void
}

export default function Error({ message, reset }: ErrorProps) {
  return (
    <div className="flex flex-grow flex-col items-center justify-center gap-y-8 p-8 pb-32 text-center">
      <div className="flex flex-col gap-y-4">
        <h2 className="text-2xl font-bold">Uh oh! Server Error{message && `: ${message}`}</h2>
        <p>It seems we&apos;ve hit a &apos;default alive&apos; problem - something&apos;s broken.</p>
      </div>

      <div className="flex flex-row justify-center gap-x-4">
        <Button variant="secondary">
          <Link href="/" className="inline-flex items-center">
            <Home className="mr-2" size={16} />
            Home
          </Link>
        </Button>
        {reset && (
          <Button variant="ghost" onClick={reset}>
            <RefreshCcw className="mr-2" size={16} />
            Try Reload
          </Button>
        )}
      </div>
    </div>
  )
}