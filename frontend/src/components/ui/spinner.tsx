import { LoaderIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function Spinner({ className, ...props }: React.ComponentProps<typeof LoaderIcon>) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("animate-spin", className)}
      {...props}
    />
  )
}
