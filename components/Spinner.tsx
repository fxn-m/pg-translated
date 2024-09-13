import { Loader2 } from "lucide-react"

export default function Spinner() {
  return (
    <div className="flex flex-grow items-center justify-center pb-32">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500 dark:text-blue-400" />
    </div>
  )
}
