"use client"

import { BookOpen, Home, Undo2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

export async function generateMetadata() {
  return {
    title: "404 - Not Found",
    description: "This essay hasn't been written yet, not even by Paul Graham."
  }
}

export default function NotFound() {
  const router = useRouter()
  return (
    <div className="flex flex-grow flex-col items-center justify-center gap-y-8 p-8 pb-32 text-center">
      <div className="flex flex-col gap-y-4">
        <h2 className="text-2xl font-bold">404 - Not Found(er Mode)</h2>
        <p className="">This essay hasn&apos;t been written yet, not even by Paul Graham.</p>
      </div>

      <div className="flex flex-row justify-center gap-x-4">
        <Button variant="secondary">
          <Link href="/" className="inline-flex items-center">
            <Home className="mr-2" size={16} />
            Home
          </Link>
        </Button>

        <Button variant="ghost">
          <Link href="/essays/english" className="inline-flex items-center">
            <BookOpen className="mr-2" size={16} />
            Browse All Essays
          </Link>
        </Button>

        <Button variant="ghost" onClick={router.back}>
          <Undo2 className="mr-2" size={16} />
          Go Back
        </Button>
      </div>
    </div>
  )
}
