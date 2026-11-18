import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-md border border-border bg-card px-3 py-3 text-base text-foreground",
        className,
      )}
      {...props}
    />
  );
}
