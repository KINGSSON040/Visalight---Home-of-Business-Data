"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@/lib/content/copy";
import { roleSlugs, type RoleSlug } from "@/lib/content/types";
import { roleLabel } from "@/lib/labels";
import { submitJobApplication, submitSpontaneousApplication } from "@/lib/actions/applications";
import {
  jobApplicationClientSchema,
  spontaneousClientSchema,
  type JobApplicationClientValues,
  type SpontaneousClientValues,
} from "@/lib/validation/schemas";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ChoiceField, FormErrorSummary, MessageField, TextField } from "@/components/forms/fields";
import { ConsentField } from "@/components/forms/ConsentField";
import { FileUpload } from "@/components/forms/FileUpload";
import { HoneypotField } from "@/components/forms/HoneypotField";
import { TurnstileField } from "@/components/forms/TurnstileField";
import { uploadCv } from "@/components/forms/upload-cv";

export function ApplyForm({ jobSlug }: { jobSlug: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [resetKey, setResetKey] = useState(0);
  const form = useForm<JobApplicationClientValues>({
    resolver: zodResolver(jobApplicationClientSchema),
    defaultValues: {
      jobSlug,
      name: "",
      email: "",
      phone: "",
      linkedin: "",
      message: "",
      consent: false,
      turnstileToken: "",
      company_website: "",
      cvPath: "",
    },
  });

  async function onSubmit(values: JobApplicationClientValues) {
    if (!file) {
      form.setError("cvPath", { message: t("forms.cvRequired") });
      setFormError(t("forms.errorSummary"));
      return;
    }
    setPending(true);
    setFormError(undefined);
    try {
      const cvPath = await uploadCv(file, values.turnstileToken);
      const result = await submitJobApplication({ ...values, cvPath });
      if (result.ok) {
        router.push("/tack/ansokan");
        return;
      }
      if (result.fieldErrors) {
        for (const [key, message] of Object.entries(result.fieldErrors)) {
          form.setError(key as keyof JobApplicationClientValues, { message });
        }
      }
      setFormError(result.formError);
      setResetKey((value) => value + 1);
      form.setValue("turnstileToken", "");
    } catch {
      form.setError("cvPath", { message: t("forms.uploadFailed") });
      setFormError(t("forms.uploadFailed"));
      setResetKey((value) => value + 1);
    } finally {
      setPending(false);
    }
  }

  return (
    <Form {...form}>
      <form className="relative grid gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <h2 className="text-2xl">{t("jobs.applyTitle")}</h2>
        <FormErrorSummary formError={formError} />
        <HoneypotField />
        <input type="hidden" {...form.register("jobSlug")} value={jobSlug} />
        <TextField name="name" label={t("forms.name")} autoComplete="name" />
        <TextField name="email" label={t("forms.email")} type="email" autoComplete="email" />
        <TextField name="phone" label={t("forms.phone")} type="tel" autoComplete="tel" />
        <TextField name="linkedin" label={t("forms.linkedin")} type="url" optional />
        <MessageField />
        <FileUpload onFile={setFile} />
        <ConsentField text={t("forms.consentApplication")} />
        <TurnstileField resetKey={resetKey} />
        <Button type="submit" disabled={pending}>
          {pending ? t("forms.sending") : t("forms.submitApplication")}
        </Button>
      </form>
    </Form>
  );
}

export function SpontaneousForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [resetKey, setResetKey] = useState(0);
  const form = useForm<SpontaneousClientValues>({
    resolver: zodResolver(spontaneousClientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      location: "",
      linkedin: "",
      message: "",
      consent: false,
      turnstileToken: "",
      company_website: "",
      cvPath: "",
    },
  });

  async function onSubmit(values: SpontaneousClientValues) {
    if (!file) {
      form.setError("cvPath", { message: t("forms.cvRequired") });
      setFormError(t("forms.errorSummary"));
      return;
    }
    setPending(true);
    setFormError(undefined);
    try {
      const cvPath = await uploadCv(file, values.turnstileToken);
      const result = await submitSpontaneousApplication({ ...values, cvPath });
      if (result.ok) {
        router.push("/tack/spontanansokan");
        return;
      }
      if (result.fieldErrors) {
        for (const [key, message] of Object.entries(result.fieldErrors)) {
          form.setError(key as keyof SpontaneousClientValues, { message });
        }
      }
      setFormError(result.formError);
      setResetKey((value) => value + 1);
      form.setValue("turnstileToken", "");
    } catch {
      form.setError("cvPath", { message: t("forms.uploadFailed") });
      setFormError(t("forms.uploadFailed"));
      setResetKey((value) => value + 1);
    } finally {
      setPending(false);
    }
  }

  return (
    <Form {...form}>
      <form className="relative grid gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FormErrorSummary formError={formError} />
        <HoneypotField />
        <TextField name="name" label={t("forms.name")} autoComplete="name" />
        <TextField name="email" label={t("forms.email")} type="email" autoComplete="email" />
        <TextField name="phone" label={t("forms.phone")} type="tel" autoComplete="tel" />
        <ChoiceField
          name="role"
          label={t("forms.role")}
          placeholder={t("forms.selectRole")}
          options={roleSlugs.map((value) => ({ value, label: roleLabel(value as RoleSlug) }))}
        />
        <TextField name="location" label={t("forms.location")} optional />
        <TextField name="linkedin" label={t("forms.linkedin")} type="url" optional />
        <MessageField />
        <FileUpload onFile={setFile} />
        <ConsentField text={t("forms.consentApplication")} />
        <TurnstileField resetKey={resetKey} />
        <Button type="submit" disabled={pending}>
          {pending ? t("forms.sending") : t("forms.submitSpontaneous")}
        </Button>
      </form>
    </Form>
  );
}
