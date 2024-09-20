"use client"

import { Home, RefreshCcw, Undo2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

type ErrorProps = {
  message: string
  reset?: () => void
}

export default function Error({ message, reset }: ErrorProps) {
  const router = useRouter()

  return (
    <div className="flex flex-grow flex-col items-center justify-center gap-y-8 p-8 pb-32 text-center">
      <div className="flex flex-col gap-y-4">
        <h2 className="flex flex-wrap justify-center gap-2 text-center text-2xl font-bold">
          <span>Uh oh!</span>
          <span>Server Error{message && `: ${message}`}</span>
        </h2>
        <p>It seems we&apos;ve hit a &apos;default alive&apos; problem - something&apos;s broken.</p>
      </div>

      <div className="flex flex-row justify-center gap-x-4">
        <Button variant="secondary">
          <Link href="/" className="inline-flex items-center">
            <Home className="mr-2" size={16} />
            Home
          </Link>
        </Button>

        <Button variant="ghost" onClick={router.back}>
          <Undo2 className="mr-2" size={16} />
          Go Back
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
