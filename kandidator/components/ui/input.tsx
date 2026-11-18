import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "min-h-11 w-full rounded-md border border-border bg-card px-3 text-base text-foreground",
        className,
      )}
      {...props}
    />
  );
}
