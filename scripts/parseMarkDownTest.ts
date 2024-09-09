import { readFileSync, writeFileSync } from "fs"

import gfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeStringify from "rehype-stringify"
import { remark } from "remark"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"

const test = async () => {
  const content = readFileSync("./scripts/example.md").toString()

  console.log("Content", content)

  // Parse the markdown with support for GFM and preserving raw HTML
  const parsedContent = await remark()
    .use(gfm)
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true }) // Pass through raw HTML
    .use(rehypeRaw) // Allow raw HTML in the output
    .use(rehypeStringify)
    .process(content)

  const contentHtml = parsedContent.toString()

  console.log("\n\n--------------------------------\n\n")

  console.log("Content HTML", contentHtml)

  //   write the content to a file
  writeFileSync("scripts/example.html", contentHtml)
}

const main = async () => {
  await test()
}

main()
