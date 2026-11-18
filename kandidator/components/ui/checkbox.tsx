"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "mt-1 flex size-6 shrink-0 items-center justify-center rounded-sm border border-primary bg-card",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <Check aria-hidden className="size-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
