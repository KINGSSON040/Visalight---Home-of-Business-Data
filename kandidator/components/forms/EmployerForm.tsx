"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@/lib/content/copy";
import { roleSlugs, serviceSlugs, type RoleSlug, type ServiceSlug } from "@/lib/content/types";
import { roleLabel, serviceLabel } from "@/lib/labels";
import { submitEmployerInquiry } from "@/lib/actions/employer";
import { employerSchema, type EmployerInput } from "@/lib/validation/schemas";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ChoiceField, FormErrorSummary, MessageField, TextField } from "@/components/forms/fields";
import { ConsentField } from "@/components/forms/ConsentField";
import { HoneypotField } from "@/components/forms/HoneypotField";
import { TurnstileField } from "@/components/forms/TurnstileField";

export function EmployerForm({
  defaultService,
  defaultRole,
}: {
  defaultService?: ServiceSlug;
  defaultRole?: RoleSlug;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [resetKey, setResetKey] = useState(0);
  const form = useForm<EmployerInput>({
    resolver: zodResolver(employerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      service: defaultService ?? "",
      role: defaultRole ?? "",
      message: "",
      consent: false,
      turnstileToken: "",
      company_website: "",
    },
  });

  async function onSubmit(values: EmployerInput) {
    setPending(true);
    setFormError(undefined);
    const result = await submitEmployerInquiry(values);
    if (result.ok) {
      router.push("/tack/forfragan");
      return;
    }
    if (result.fieldErrors) {
      for (const [key, message] of Object.entries(result.fieldErrors)) {
        form.setError(key as keyof EmployerInput, { message });
      }
    }
    setFormError(result.formError);
    setResetKey((value) => value + 1);
    form.setValue("turnstileToken", "");
    setPending(false);
  }

  return (
    <Form {...form}>
      <form className="relative grid gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FormErrorSummary formError={formError} />
        <HoneypotField />
        <TextField name="name" label={t("forms.name")} autoComplete="name" />
        <TextField name="email" label={t("forms.email")} type="email" autoComplete="email" />
        <TextField name="phone" label={t("forms.phone")} type="tel" autoComplete="tel" />
        <TextField name="company" label={t("forms.company")} autoComplete="organization" />
        <ChoiceField
          name="service"
          label={t("forms.service")}
          placeholder={t("forms.selectService")}
          options={serviceSlugs.map((value) => ({ value, label: serviceLabel(value) }))}
        />
        <ChoiceField
          name="role"
          label={t("forms.role")}
          placeholder={t("forms.selectRole")}
          options={roleSlugs.map((value) => ({ value, label: roleLabel(value) }))}
        />
        <MessageField required />
        <ConsentField text={t("forms.consentInquiry")} />
        <TurnstileField resetKey={resetKey} />
        <Button type="submit" disabled={pending}>
          {pending ? t("forms.sending") : t("forms.submitInquiry")}
        </Button>
      </form>
    </Form>
  );
}
