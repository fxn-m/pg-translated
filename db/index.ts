import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

console.log(process.env.DATABASE_URL)
console.log("Connecting to database...")
console.log("Connecting to database...")
console.log("Connecting to database...")
console.log("Connecting to database...")

export const db = drizzle(postgres(process.env.DATABASE_URL!))
