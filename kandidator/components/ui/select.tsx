"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex min-h-11 w-full items-center justify-between gap-2 rounded-md border border-border bg-card px-3 text-left text-base",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown aria-hidden className="size-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className="z-50 max-h-80 overflow-hidden rounded-md border border-border bg-card shadow-md"
        position="popper"
        sideOffset={4}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex min-h-11 cursor-pointer items-center rounded-sm pr-3 pl-8 text-base outline-none data-[highlighted]:bg-secondary",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemIndicator className="absolute left-2">
        <Check aria-hidden className="size-4" />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
