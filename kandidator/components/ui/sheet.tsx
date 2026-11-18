"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;

export function SheetContent({
  title,
  closeLabel,
  children,
  className,
}: {
  title: string;
  closeLabel: string;
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/20" />
      <Dialog.Content
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[min(100%,22rem)] flex-col bg-card p-6 shadow-lg",
          className,
        )}
      >
        <motion.div
          className="flex h-full flex-col"
          initial={reduce ? false : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reduce ? 0 : 0.3, ease: "easeOut" }}
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <Dialog.Title className="font-heading text-2xl">{title}</Dialog.Title>
            <Dialog.Close className="inline-flex size-11 items-center justify-center rounded-md border border-border">
              <X aria-hidden className="size-5" />
              <span className="sr-only">{closeLabel}</span>
            </Dialog.Close>
          </div>
          {children}
        </motion.div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
