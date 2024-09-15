"use server"

import { count, eq } from "drizzle-orm"

import { db } from "@/db"
import { feedback } from "@/db/schema"

export async function submitFeedback(essayId: number, feedbackType: string, content?: string) {
  // Validate feedback type
  const validFeedbackTypes = ["like", "dislike", "error"]
  if (!validFeedbackTypes.includes(feedbackType)) {
    throw new Error("Invalid feedback type")
  }

  // Insert feedback into the database
  await db.insert(feedback).values({
    essay_id: essayId,
    feedback_type: feedbackType,
    content: content || null
  })
}

export async function getFeedbackCounts(essayId: number) {
  const feedbackCounts = await db
    .select({ feedbackType: feedback.feedback_type, count: count() })
    .from(feedback)
    .where(eq(feedback.essay_id, essayId))
    .groupBy(feedback.feedback_type)

  // Initialize counts with zeros
  const counts = {
    likes: 0,
    dislikes: 0,
    errors: 0
  }

  // Map the feedbackCounts to the counts object
  feedbackCounts.forEach((item) => {
    switch (item.feedbackType) {
      case "like":
        counts.likes = item.count
        break
      case "dislike":
        counts.dislikes = item.count
        break
      case "error":
        counts.errors = item.count
        break
    }
  })

  return counts
}
