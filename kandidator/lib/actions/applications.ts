"use server";

import { getApplicationTarget } from "@/lib/ats/applications";
import { getJobSource } from "@/lib/ats";
import { readPrivateCv } from "@/lib/blob/cv";
import { t } from "@/lib/content/copy";
import { logForm, requestIp } from "@/lib/log";
import { verifyTurnstile } from "@/lib/turnstile";
import { fieldErrorsFromZod, honeypotFilled, jobApplicationSchema, spontaneousSchema } from "@/lib/validation/schemas";
import type { ActionResult } from "@/lib/actions/types";

export async function submitJobApplication(input: unknown): Promise<ActionResult> {
  if (honeypotFilled(input)) {
    logForm("application", true, "honeypot");
    return { ok: true };
  }
  const parsed = jobApplicationSchema.safeParse(input);
  if (!parsed.success) {
    logForm("application", false, "validation");
    return { ok: false, formError: t("forms.errorSummary"), fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  const human = await verifyTurnstile(parsed.data.turnstileToken, await requestIp());
  if (!human) {
    logForm("application", false, "turnstile");
    return { ok: false, formError: t("errors.turnstile"), fieldErrors: { turnstileToken: t("errors.turnstile") } };
  }
  const job = await (await getJobSource()).getBySlug(parsed.data.jobSlug);
  if (!job || job.status !== "open") {
    logForm("application", false, "validation");
    return { ok: false, formError: t("errors.job"), fieldErrors: { jobSlug: t("errors.job") } };
  }
  const cv = await readPrivateCv(parsed.data.cvPath);
  if (!cv.ok) {
    logForm("application", false, "blob");
    return { ok: false, formError: cv.message, fieldErrors: { cvPath: cv.message } };
  }
  try {
    const target = await getApplicationTarget();
    await target.submit({
      kind: "job",
      jobSlug: job.slug,
      jobTitle: job.title,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      linkedin: parsed.data.linkedin || undefined,
      message: parsed.data.message || undefined,
      cv: cv.file,
    });
    logForm("application", true);
    return { ok: true };
  } catch {
    logForm("application", false, "resend");
    return { ok: false, formError: t("errors.send") };
  }
}

export async function submitSpontaneousApplication(input: unknown): Promise<ActionResult> {
  if (honeypotFilled(input)) {
    logForm("spontaneous", true, "honeypot");
    return { ok: true };
  }
  const parsed = spontaneousSchema.safeParse(input);
  if (!parsed.success) {
    logForm("spontaneous", false, "validation");
    return { ok: false, formError: t("forms.errorSummary"), fieldErrors: fieldErrorsFromZod(parsed.error) };
  }
  const human = await verifyTurnstile(parsed.data.turnstileToken, await requestIp());
  if (!human) {
    logForm("spontaneous", false, "turnstile");
    return { ok: false, formError: t("errors.turnstile"), fieldErrors: { turnstileToken: t("errors.turnstile") } };
  }
  const cv = await readPrivateCv(parsed.data.cvPath);
  if (!cv.ok) {
    logForm("spontaneous", false, "blob");
    return { ok: false, formError: cv.message, fieldErrors: { cvPath: cv.message } };
  }
  try {
    const target = await getApplicationTarget();
    await target.submit({
      kind: "spontaneous",
      role: parsed.data.role,
      location: parsed.data.location || undefined,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      linkedin: parsed.data.linkedin || undefined,
      message: parsed.data.message || undefined,
      cv: cv.file,
    });
    logForm("spontaneous", true);
    return { ok: true };
  } catch {
    logForm("spontaneous", false, "resend");
    return { ok: false, formError: t("errors.send") };
  }
}
