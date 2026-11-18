"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Accordion = AccordionPrimitive.Root;
export const AccordionItem = AccordionPrimitive.Item;

export function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="m-0">
      <AccordionPrimitive.Trigger
        className={cn(
          "flex min-h-11 w-full items-center justify-between gap-4 py-3 text-left text-base font-semibold",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown aria-hidden className="size-4 shrink-0" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content className={cn("pb-4 text-base", className)} {...props}>
      {children}
    </AccordionPrimitive.Content>
  );
}
