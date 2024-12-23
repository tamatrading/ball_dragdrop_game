import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
)

const Button = ({ className, ...props }) => {
  return (
    <button
      className={cn(buttonVariants(), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }