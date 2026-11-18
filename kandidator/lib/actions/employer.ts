"use server";

import { t } from "@/lib/content/copy";
import { logForm, requestIp } from "@/lib/log";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendEmployerInquiry } from "@/lib/email/send";
import { employerSchema, fieldErrorsFromZod, honeypotFilled } from "@/lib/validation/schemas";
import type { ActionResult } from "@/lib/actions/types";

export async function submitEmployerInquiry(input: unknown): Promise<ActionResult> {
  if (honeypotFilled(input)) {
    logForm("employer", true, "honeypot");
    return { ok: true };
  }
  const parsed = employerSchema.safeParse(input);
  if (!parsed.success) {
    logForm("employer", false, "validation");
    return {
      ok: false,
      formError: t("forms.errorSummary"),
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const human = await verifyTurnstile(parsed.data.turnstileToken, await requestIp());
  if (!human) {
    logForm("employer", false, "turnstile");
    return {
      ok: false,
      formError: t("errors.turnstile"),
      fieldErrors: { turnstileToken: t("errors.turnstile") },
    };
  }
  try {
    await sendEmployerInquiry(parsed.data);
    logForm("employer", true);
    return { ok: true };
  } catch {
    logForm("employer", false, "resend");
    return { ok: false, formError: t("errors.send") };
  }
}
