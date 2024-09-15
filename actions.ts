"use server"

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
