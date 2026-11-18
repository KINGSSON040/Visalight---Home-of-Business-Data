import { z } from "zod";
import { t } from "@/lib/content/copy";
import { isRoleSlug, isServiceSlug } from "@/lib/content/types";

const phone = z
  .string()
  .trim()
  .min(6, t("errors.phone"))
  .max(20, t("errors.phone"))
  .regex(/^\+?[0-9 ]+$/, t("errors.phone"));

const email = z
  .string()
  .trim()
  .max(200, t("errors.email"))
  .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), t("errors.email"));

const optionalUrl = z
  .string()
  .trim()
  .max(300, t("errors.linkedin"))
  .refine((value) => value === "" || /^https?:\/\/\S+$/i.test(value), t("errors.linkedin"));

const consent = z.boolean().refine((value) => value === true, t("errors.consent"));

const turnstileToken = z.string().min(1, t("errors.turnstile"));

const honeypot = z.string().optional();

export const employerSchema = z.object({
  name: z.string().trim().min(2, t("errors.name")).max(80, t("errors.name")),
  email,
  phone,
  company: z.string().trim().min(2, t("errors.company")).max(120, t("errors.company")),
  service: z.string().refine(isServiceSlug, t("errors.service")),
  role: z.string().refine(isRoleSlug, t("errors.role")),
  message: z.string().trim().min(20, t("errors.messageShort")).max(2000, t("errors.messageLong")),
  consent,
  turnstileToken,
  company_website: honeypot,
});

export const jobApplicationSchema = z.object({
  jobSlug: z
    .string()
    .trim()
    .min(1, t("errors.job"))
    .max(120, t("errors.job"))
    .regex(/^[a-z0-9-]+$/, t("errors.job")),
  name: z.string().trim().min(2, t("errors.name")).max(80, t("errors.name")),
  email,
  phone,
  linkedin: optionalUrl,
  message: z.string().trim().max(2000, t("errors.messageLong")),
  cvPath: z
    .string()
    .trim()
    .min(1, t("errors.cv"))
    .max(500, t("errors.cvPath"))
    .refine((value) => !value.includes("..") && !value.startsWith("http") && !value.startsWith("/"), t("errors.cvPath")),
  consent,
  turnstileToken,
  company_website: honeypot,
});

export const spontaneousSchema = z.object({
  name: z.string().trim().min(2, t("errors.name")).max(80, t("errors.name")),
  email,
  phone,
  role: z.string().refine(isRoleSlug, t("errors.role")),
  location: z.string().trim().max(80, t("errors.location")),
  linkedin: optionalUrl,
  message: z.string().trim().max(2000, t("errors.messageLong")),
  cvPath: jobApplicationSchema.shape.cvPath,
  consent,
  turnstileToken,
  company_website: honeypot,
});

const clientCvPath = z.string().optional();

export const jobApplicationClientSchema = jobApplicationSchema.omit({ cvPath: true }).extend({
  cvPath: clientCvPath,
});
export const spontaneousClientSchema = spontaneousSchema.omit({ cvPath: true }).extend({
  cvPath: clientCvPath,
});

export type EmployerInput = z.input<typeof employerSchema>;
export type EmployerValues = z.output<typeof employerSchema>;
export type JobApplicationInput = z.input<typeof jobApplicationSchema>;
export type JobApplicationValues = z.output<typeof jobApplicationSchema>;
export type SpontaneousInput = z.input<typeof spontaneousSchema>;
export type SpontaneousValues = z.output<typeof spontaneousSchema>;
export type JobApplicationClientValues = z.input<typeof jobApplicationClientSchema>;
export type SpontaneousClientValues = z.input<typeof spontaneousClientSchema>;

export function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}

export function honeypotFilled(input: unknown): boolean {
  if (!input || typeof input !== "object") return false;
  const value = (input as { company_website?: unknown }).company_website;
  return typeof value === "string" && value.trim() !== "";
}
