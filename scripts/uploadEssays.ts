import { SupportedLanguage, supportedLanguages } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { readFileSync, readdirSync } from "fs"

import { db } from "@/db"
import { essays } from "@/db/schema"
import path from "path"
import yaml from "js-yaml"

const fileName = "" // * if uploading a specific file for testing

async function uploadEssays(uploadedFiles: string[], language: SupportedLanguage, model: string) {
  const essayDirectory = path.join(__dirname, "../python/essaysMD" + language + `${language !== "english" ? "-" + model : ""}`)
  const files = readdirSync(essayDirectory)

  if (model === "claude-3-haiku-20240307") {
    model = "claude-3-haiku"
  }

  for (const file of files) {
    if (fileName && file !== fileName) {
      continue
    }

    if (file == "polls.md" || file == "foundervisa.md") {
      continue
    }

    if (uploadedFiles.includes(file.split(".")[0])) {
      console.log(`${file} already uploaded!\n`)
      continue
    }

    const markdown = readFileSync(path.join(essayDirectory, file), "utf-8")
    const match = markdown.match(/^---\n([\s\S]+?)\n---/)

    type Metadata = {
      title?: string
      translated_title?: string
      date?: string
      model?: string
    }

    let metadata: Metadata = {}
    let content = markdown

    if (match) {
      metadata = yaml.load(match[1]) as Metadata
      content = markdown.slice(match[0].length).trim()
    }

    if (content.length === 0) {
      console.error(`Failed to upload ${file}: content not found\n`)
      continue
    }

    console.log(`Uploading ${metadata.title || file.split(".")[0]}...`)
    console.log(`Language: ${language}`)
    console.log(`Model: ${model}`)

    const date_written = metadata.date && new Date(metadata.date?.match(/([A-Za-z]+\s\d{4})/)![0]).toISOString()

    if (!date_written) {
      console.error(`Failed to upload ${file}: date not found in metadata\n`)
      continue
    }

    if (!supportedLanguages.includes(language as SupportedLanguage)) {
      console.error(`Failed to upload ${file}: invalid language`)
      continue
    }

    try {
      await db.insert(essays).values({
        title: metadata.title || file.split(".")[0],
        short_title: file.split(".")[0],
        translated_title: metadata.translated_title || metadata.title || file.split(".")[0],
        content,
        date_written: date_written,
        language: language as SupportedLanguage,
        likes: 0,
        translationModel: language !== "english" ? model : undefined
      })
      console.log(`${file} uploaded successfully!\n`)
    } catch (e) {
      console.error(`Failed to upload ${file}:\n`, e)
    }
  }
}

const main = async () => {
  const models = ["gpt-4o-mini", "claude-3-haiku-20240307"]
  for (const language of supportedLanguages) {
    for (const model of models) {
      if (language === "english" && model === "claude-3-haiku-20240307") {
        continue
      }

      const uploadedEssays = await db
        .select()
        .from(essays)
        .where(
          and(eq(essays.language, language as SupportedLanguage), eq(essays.translationModel, model === "claude-3-haiku-20240307" ? "claude-3-haiku" : model))
        )

      const uploadedShortTitles = uploadedEssays.map((essay) => essay.short_title)

      await uploadEssays(uploadedShortTitles, language, model)
    }
  }

  process.exit(0)
}

main()
