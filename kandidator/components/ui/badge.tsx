import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-accent px-3 py-1 text-base font-semibold text-accent",
        className,
      )}
      {...props}
    />
  );
}
