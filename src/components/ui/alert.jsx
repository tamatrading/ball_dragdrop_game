import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
)

const Alert = ({ className, ...props }) => {
  return (
    <div
      role="alert"
      className={cn(alertVariants(), className)}
      {...props}
    />
  )
}

export { Alert, alertVariants }