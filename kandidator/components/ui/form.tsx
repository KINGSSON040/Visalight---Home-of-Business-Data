"use client";

import { Slot } from "@radix-ui/react-slot";
import { createContext, useContext, useId } from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export const Form = FormProvider;

const FormFieldContext = createContext<{ name: string } | null>(null);

export function FormField<T extends FieldValues, TName extends FieldPath<T>>(props: ControllerProps<T, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: String(props.name) }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

const FormItemContext = createContext<{ id: string } | null>(null);

export function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const generatedId = useId();
  const field = useContext(FormFieldContext);
  const id = field?.name ?? generatedId;
  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("grid gap-2", className)} {...props} />
    </FormItemContext.Provider>
  );
}

function useFormField() {
  const field = useContext(FormFieldContext);
  const item = useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();
  if (!field || !item) {
    throw new Error("Formfält saknar kontext");
  }
  const state = getFieldState(field.name, formState);
  return { id: item.id, name: field.name, ...state };
}

export function FormLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  const field = useFormField();
  return <Label htmlFor={field.id} className={cn(field.error && "text-destructive", className)} {...props} />;
}

export function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const field = useFormField();
  return (
    <Slot
      id={field.id}
      aria-invalid={field.error ? true : undefined}
      aria-describedby={field.error ? `${field.id}-error` : undefined}
      {...props}
    />
  );
}

export function FormMessage() {
  const field = useFormField();
  if (!field.error?.message) return null;
  return (
    <p id={`${field.id}-error`} className="text-base text-destructive">
      {String(field.error.message)}
    </p>
  );
}

export function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-base text-muted-foreground", className)} {...props} />;
}
