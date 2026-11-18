"use client";

import { useFormContext, type FieldValues, type Path } from "react-hook-form";
import { t } from "@/lib/content/copy";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const order = [
  "name",
  "email",
  "phone",
  "company",
  "service",
  "role",
  "location",
  "linkedin",
  "message",
  "cvPath",
  "consent",
  "turnstileToken",
];

export function FormErrorSummary({ formError }: { formError?: string }) {
  const { formState } = useFormContext();
  const first = order.find((name) => formState.errors[name]);
  if (!formError && !first) return null;
  const message = formError || t("forms.errorSummary");
  return (
    <div role="alert" className="rounded-md border border-destructive bg-card p-4 text-destructive">
      {first ? <a href={`#${first}`}>{message}</a> : <p>{message}</p>}
    </div>
  );
}

export function TextField({
  name,
  label,
  type = "text",
  autoComplete,
  optional = false,
}: {
  name: Path<FieldValues>;
  label: string;
  type?: string;
  autoComplete?: string;
  optional?: boolean;
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {optional ? <span className="font-normal text-muted-foreground"> ({t("forms.optional")})</span> : null}
          </FormLabel>
          <FormControl>
            <Input type={type} autoComplete={autoComplete} {...field} value={field.value ?? ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function MessageField({ required = false }: { required?: boolean }) {
  return (
    <FormField
      name="message"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {t("forms.message")}
            {required ? null : <span className="font-normal text-muted-foreground"> ({t("forms.optional")})</span>}
          </FormLabel>
          <FormControl>
            <Textarea {...field} value={field.value ?? ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function ChoiceField({
  name,
  label,
  placeholder,
  options,
}: {
  name: "service" | "role";
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select value={field.value || undefined} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
