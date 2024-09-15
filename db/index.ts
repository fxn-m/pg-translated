// import { drizzle } from "drizzle-orm/postgres-js"
// import postgres from "postgres"
// export const db = drizzle(postgres(process.env.SUPABASE_DATABASE_URL!))

import * as schema from "./schema"

import { drizzle } from "drizzle-orm/vercel-postgres"
import { sql } from "@vercel/postgres"

export const db = drizzle(sql, { schema })
