import { readFileSync, readdirSync } from "fs"

import { db } from "@/db"
import { essays } from "@/db/schema"
import path from "path"

const essayDirectory = path.join(__dirname, "../python/essaysMDEnglish")

const files = readdirSync(essayDirectory)

async function uploadEssays() {
  for (const file of files) {
    const content = readFileSync(path.join(essayDirectory, file)).toString()
    console.log(`Uploading ${file.split(".")[0]}...`)

    try {
      await db.insert(essays).values({
        title: file.split(".")[0],
        content,
        likes: 0,
        language: "English"
      })
      console.log(`${file} uploaded successfully!`)
    } catch (e) {
      console.error(`Failed to upload ${file}:`, e)
    }
  }
}

uploadEssays()
