"use client"

import { AlertCircle, ThumbsDown, ThumbsUp } from "lucide-react"
import { useState, useTransition } from "react"

import { submitFeedback } from "@/actions"
import { useToast } from "@/hooks/use-toast"

export default function Feedback({ essayId, counts }: { essayId: number; counts: { likes: number; dislikes: number; errors: number } }) {
  const [isPending, startTransition] = useTransition()
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [localCounts, setLocalCounts] = useState(counts)
  const { toast } = useToast()

  function handleFeedback(feedbackType: "like" | "dislike" | "error") {
    startTransition(async () => {
      try {
        await submitFeedback(essayId, feedbackType)
        setFeedbackSent(true)

        // Update local counts
        setLocalCounts((prevCounts) => ({
          ...prevCounts,
          [feedbackType + "s"]: prevCounts[feedbackType + "s"] + 1
        }))

        // Show success toast
        toast({
          title: "Thank you for your feedback!",
          description: `Your ${feedbackType} has been recorded.`,
          variant: "success"
        })
      } catch (error) {
        console.error(error)
        // Show error toast
        toast({
          title: "Error",
          description: "There was an error submitting your feedback.",
          variant: "destructive"
        })
      }
    })
  }

  return (
    <div className="fixed bottom-4 right-4">
      <div className="flex flex-col items-center space-y-4">
        <button
          className={`flex flex-col items-center text-gray-600 ${!feedbackSent ? "hover:text-green-500" : "hover: cursor-not-allowed"}`}
          onClick={() => handleFeedback("like")}
          disabled={isPending || feedbackSent}
        >
          <ThumbsUp className="h-6 w-6" />
          <span className="text-xs">Like ({localCounts.likes})</span>
        </button>
        <button
          className={`flex flex-col items-center text-gray-600 ${!feedbackSent ? "hover:text-red-500" : "hover: cursor-not-allowed"}`}
          onClick={() => handleFeedback("dislike")}
          disabled={isPending || feedbackSent}
        >
          <ThumbsDown className="h-6 w-6" />
          <span className="text-xs">Dislike ({localCounts.dislikes})</span>
        </button>
        <button
          className={`flex flex-col items-center text-gray-600 ${!feedbackSent ? "hover:text-yellow-500" : "hover: cursor-not-allowed"}`}
          onClick={() => handleFeedback("error")}
          disabled={isPending || feedbackSent}
        >
          <AlertCircle className="h-6 w-6" />
          <span className="text-xs">Error ({localCounts.errors})</span>
        </button>
      </div>
    </div>
  )
}
