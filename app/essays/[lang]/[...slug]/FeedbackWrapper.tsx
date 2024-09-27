"use client"

import { Suspense, useState } from "react"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import dynamic from "next/dynamic"

const Feedback = dynamic(() => import("./Feedback"), {
  suspense: true
})

export default function FeedbackButtonWrapper({ essayId }: { essayId: number }) {
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false)

  return (
    <div className="sm:fixed sm:bottom-4 sm:right-4">
      <Button
        className="h-14 w-14 rounded-full dark:border-slate-500 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        variant="outline"
        onMouseEnter={() => {
          setIsFeedbackVisible((prev) => !prev)
        }}
      >
        <MessageCircle />
      </Button>

      {isFeedbackVisible && (
        <Suspense fallback={<div>Loading Feedback...</div>}>
          <Feedback essayId={essayId} />
        </Suspense>
      )}
    </div>
  )
}
