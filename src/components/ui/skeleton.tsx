import { cn } from "@/lib/utils"

<<<<<<< HEAD
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
=======
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
>>>>>>> 7a447fe120c4e223cf4d15306c73f8e10a03464f
      {...props}
    />
  )
}

export { Skeleton }
