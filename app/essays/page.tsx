// redirect to /essays/english

import { redirect } from "next/navigation"

export default function Page() {
  redirect("/essays/english")
}
