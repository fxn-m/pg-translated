// TODO: Skip existing essays

import { readFileSync, readdirSync } from "fs"

import { db } from "@/db"
import { essays } from "@/db/schema"
import path from "path"
import yaml from "js-yaml"

const language = "english"
const essayDirectory = path.join(__dirname, "../python/essaysMD" + language)
const files = readdirSync(essayDirectory)

async function uploadEssays() {
  for (const file of files) {
    if (file != "greatwork.md") {
      continue
    }

    const markdown = readFileSync(path.join(essayDirectory, file), "utf-8")
    const match = markdown.match(/^---\n([\s\S]+?)\n---/)

    type Metadata = {
      title?: string
      date?: string
      model?: string
    }

    let metadata: Metadata = {}
    let content = markdown

    if (match) {
      metadata = yaml.load(match[1]) as Metadata
      content = markdown.slice(match[0].length).trim()
    }

    console.log(`Uploading ${metadata.title || file.split(".")[0]}...`)

    const date_written = metadata.date ? new Date(metadata.date) : new Date()

    try {
      await db.insert(essays).values({
        title: metadata.title || file.split(".")[0],
        short_title: file.split(".")[0],
        content,
        date_written: date_written.toISOString(),
        language,
        likes: 0
      })
      console.log(`${file} uploaded successfully!`)
    } catch (e) {
      console.error(`Failed to upload ${file}:`, e)
    }
  }
}
const main = async () => {
  await uploadEssays()
  process.exit(0)
}

main()
