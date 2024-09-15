"use client"

import { AlertCircle, MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getFeedback, submitFeedback } from "@/actions"
import { useEffect, useRef, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import clsx from "clsx"
import { useToast } from "@/hooks/use-toast"

type FeedbackType = "like" | "dislike" | "error"

interface FeedbackCounts {
  likes: number
  dislikes: number
  errors: number
}

type FeedbackButtonProps = {
  type: FeedbackType
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  handleFeedback: (feedbackType: FeedbackType) => void
  isDisabled: boolean
  count: number
  feedbackSent: boolean
  selectedFeedbackType: string
}

const FeedbackButton = ({ type, Icon, label, handleFeedback, isDisabled, count, feedbackSent, selectedFeedbackType }: FeedbackButtonProps) => {
  const isSelected = feedbackSent && type === selectedFeedbackType

  const colorClasses = {
    like: {
      textColor: "text-green-500",
      hoverTextColor: "hover:text-green-500"
    },
    dislike: {
      textColor: "text-red-500",
      hoverTextColor: "hover:text-red-500"
    },
    error: {
      textColor: "text-yellow-500",
      hoverTextColor: "hover:text-yellow-500"
    }
  }

  return (
    <button
      className={clsx(
        "flex w-full items-center justify-between rounded-md px-3 py-2 transition-colors",
        !isDisabled && ["hover:bg-gray-100", "dark:hover:bg-slate-600", colorClasses[type].hoverTextColor],
        isSelected ? colorClasses[type].textColor : "text-gray-600 dark:text-gray-500",
        isDisabled && "cursor-not-allowed"
      )}
      onClick={() => handleFeedback(type)}
      disabled={isDisabled}
      aria-label={label}
    >
      <div className="flex w-full items-center justify-between">
        <Icon className="h-6 w-6" aria-hidden="true" />
        <span className="text-sm">{label}</span>
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium dark:bg-slate-800">{count}</span>
      </div>
    </button>
  )
}

export default function Feedback({ essayId }: { essayId: number }) {
  const [isPending, startTransition] = useTransition()
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [selectedFeedbackType, setSelectedFeedbackType] = useState<FeedbackType | "">("")
  const [localCounts, setLocalCounts] = useState<FeedbackCounts>({
    likes: 0,
    dislikes: 0,
    errors: 0
  })
  const [optionsOpen, setOptionsOpen] = useState(false)
  const feedbackRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function loadFeedbackCounts() {
      const counts = await getFeedback(essayId)
      setLocalCounts(counts)
    }

    loadFeedbackCounts()
  }, [essayId])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (feedbackRef.current && !feedbackRef.current.contains(event.target as Node)) {
        setOptionsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const feedbackTypeToKeyMap: Record<FeedbackType, keyof FeedbackCounts> = {
    like: "likes",
    dislike: "dislikes",
    error: "errors"
  }

  const feedbackOptions: FeedbackOptionsType[] = [
    { type: "like", Icon: ThumbsUp, label: "Good" },
    { type: "dislike", Icon: ThumbsDown, label: "Poor" },
    { type: "error", Icon: AlertCircle, label: "Error" }
  ]

  const handleFeedback = (feedbackType: FeedbackType) => {
    startTransition(async () => {
      try {
        await submitFeedback(essayId, feedbackType)
        setFeedbackSent(true)
        setSelectedFeedbackType(feedbackType)

        const key = feedbackTypeToKeyMap[feedbackType]
        setLocalCounts((prevCounts) => ({
          ...prevCounts,
          [key]: prevCounts[key] + 1
        }))

        setOptionsOpen(false)

        toast({
          title: "Thank you!",
          description: `Your feedback has been recorded.`
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

  type FeedbackOptionsType = {
    type: FeedbackType
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    label: string
  }

  return (
    <div className="sm:fixed sm:bottom-4 sm:right-4">
      <Popover open={optionsOpen}>
        <PopoverTrigger asChild onClick={() => setOptionsOpen(true)}>
          <Button
            className={
              "h-14 w-14 rounded-full dark:border-slate-500 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            }
            variant="outline"
          >
            <MessageCircle />
          </Button>
        </PopoverTrigger>
        <PopoverContent ref={feedbackRef} className="mx-2 w-auto dark:border-slate-500 dark:bg-slate-900">
          <div className="flex flex-col space-y-2">
            <p className="text-center text-sm font-semibold dark:text-gray-400">Translation Feedback</p>
            {feedbackOptions.map(({ type, Icon, label }) => (
              <FeedbackButton
                key={type}
                type={type}
                Icon={Icon}
                label={label}
                handleFeedback={handleFeedback}
                isDisabled={isDisabled}
                count={localCounts[feedbackTypeToKeyMap[type]] || 0}
                feedbackSent={feedbackSent}
                selectedFeedbackType={selectedFeedbackType}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
