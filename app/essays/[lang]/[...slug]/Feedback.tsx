// "use client"

// import { AlertCircle, ThumbsDown, ThumbsUp } from "lucide-react"
// import { useState, useTransition } from "react"

// import { submitFeedback } from "@/actions"
// import { useToast } from "@/hooks/use-toast"

// export default function Feedback({ essayId, counts }: { essayId: number; counts: { likes: number; dislikes: number; errors: number } }) {
//   const [isPending, startTransition] = useTransition()
//   const [feedbackSent, setFeedbackSent] = useState(false)
//   const [localCounts, setLocalCounts] = useState(counts)
//   const { toast } = useToast()

//   function handleFeedback(feedbackType: "like" | "dislike" | "error") {
//     startTransition(async () => {
//       try {
//         await submitFeedback(essayId, feedbackType)
//         setFeedbackSent(true)

//         // Update local counts
//         setLocalCounts((prevCounts) => ({
//           ...prevCounts,
//           [feedbackType + "s"]: prevCounts[feedbackType + "s"] + 1
//         }))

//         // Show success toast
//         toast({
//           title: "Thank you for your feedback!",
//           description: `Your ${feedbackType} has been recorded.`,
//           variant: "success"
//         })
//       } catch (error) {
//         console.error(error)
//         // Show error toast
//         toast({
//           title: "Error",
//           description: "There was an error submitting your feedback.",
//           variant: "destructive"
//         })
//       }
//     })
//   }

//   return (
//     <div className="fixed bottom-4 right-4">
//       <div className="flex flex-col items-center space-y-4">
//         <button
//           className={`flex flex-col items-center text-gray-600 ${!feedbackSent ? "hover:text-green-500" : "hover: cursor-not-allowed"}`}
//           onClick={() => handleFeedback("like")}
//           disabled={isPending || feedbackSent}
//         >
//           <ThumbsUp className="h-6 w-6" />
//           <span className="text-xs">Like ({localCounts.likes})</span>
//         </button>
//         <button
//           className={`flex flex-col items-center text-gray-600 ${!feedbackSent ? "hover:text-red-500" : "hover: cursor-not-allowed"}`}
//           onClick={() => handleFeedback("dislike")}
//           disabled={isPending || feedbackSent}
//         >
//           <ThumbsDown className="h-6 w-6" />
//           <span className="text-xs">Dislike ({localCounts.dislikes})</span>
//         </button>
//         <button
//           className={`flex flex-col items-center text-gray-600 ${!feedbackSent ? "hover:text-yellow-500" : "hover: cursor-not-allowed"}`}
//           onClick={() => handleFeedback("error")}
//           disabled={isPending || feedbackSent}
//         >
//           <AlertCircle className="h-6 w-6" />
//           <span className="text-xs">Error ({localCounts.errors})</span>
//         </button>
//       </div>
//     </div>
//   )
// }

"use client"

import { AlertCircle, ThumbsDown, ThumbsUp } from "lucide-react"
import { useState, useTransition } from "react"

import clsx from "clsx"
import { submitFeedback } from "@/actions"
import { useToast } from "@/hooks/use-toast"

const FeedbackButton = ({
  type,
  Icon,
  label,
  color,
  handleFeedback,
  isDisabled,
  count,
  feedbackSent,
  selectedFeedbackType // Added this line
}: {
  type: string
  Icon: React.ComponentType<{ className: string }>
  label: string
  color: string
  handleFeedback: (type: string) => void
  isDisabled: boolean
  count: number
  feedbackSent: boolean
  selectedFeedbackType: string | null // Added this line
}) => (
  <button
    key={type}
    className={clsx(
      "flex w-full items-center justify-between rounded-md px-3 py-2 transition-colors",
      !isDisabled && `hover:bg-gray-100 dark:hover:bg-slate-600 hover:text-${color}-500`,
      feedbackSent && type === selectedFeedbackType ? `text-${color}-500` : "text-gray-600 dark:text-gray-500",
      isDisabled && "cursor-not-allowed"
    )}
    onClick={() => handleFeedback(type)}
    disabled={isDisabled}
    aria-label={label}
  >
    <div className="flex items-center gap-2">
      <Icon className="h-6 w-6" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
    <span className="ml-2 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium dark:bg-slate-800">{count}</span>
  </button>
)

export default function Feedback({ essayId, counts }: { essayId: number; counts: { likes: number; dislikes: number; errors: number } }) {
  const [isPending, startTransition] = useTransition()
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [selectedFeedbackType, setSelectedFeedbackType] = useState<string | null>(null)
  const [localCounts, setLocalCounts] = useState(counts)
  const { toast } = useToast()

  function handleFeedback(feedbackType: "like" | "dislike" | "error") {
    startTransition(async () => {
      try {
        await submitFeedback(essayId, feedbackType)
        setFeedbackSent(true)
        setSelectedFeedbackType(feedbackType)

        setLocalCounts((prevCounts) => ({
          ...prevCounts,
          [(feedbackType + "s") as keyof typeof localCounts]: prevCounts[(feedbackType + "s") as keyof typeof localCounts] + 1
        }))

        toast({
          title: "Thank you for your feedback!",
          description: `Your ${feedbackType} has been recorded.`,
          variant: "destructive"
        })
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "There was an error submitting your feedback.",
          variant: "destructive"
        })
      }
    })
  }

  const isDisabled = isPending || feedbackSent

  const feedbackOptions = [
    { type: "like", Icon: ThumbsUp, label: "Like", color: "green" },
    { type: "dislike", Icon: ThumbsDown, label: "Dislike", color: "red" },
    { type: "error", Icon: AlertCircle, label: "Error", color: "yellow" }
  ]

  return (
    <div className="fixed bottom-4 right-4">
      <div className="rounded-lg bg-white p-2 shadow-md dark:bg-slate-800 dark:text-white">
        <div className="flex flex-col space-y-2">
          {feedbackOptions.map(({ type, Icon, label, color }) => (
            <FeedbackButton
              key={type}
              type={type}
              Icon={Icon as React.ComponentType<{ className: string }>}
              label={label}
              color={color}
              handleFeedback={handleFeedback as (type: string) => void}
              isDisabled={isDisabled}
              count={localCounts?.[`${type}s` as keyof typeof localCounts] || 0}
              feedbackSent={feedbackSent}
              selectedFeedbackType={selectedFeedbackType} // Added this line
            />
          ))}
        </div>
      </div>
    </div>
  )
}
