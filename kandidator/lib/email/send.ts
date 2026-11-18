import "server-only";

import { Resend } from "resend";
import { t } from "@/lib/content/copy";
import type { EmployerValues } from "@/lib/validation/schemas";
import type { Submission } from "@/lib/content/types";
import { roleLabel, serviceLabel } from "@/lib/labels";
import { deletePrivateCv } from "@/lib/blob/cv";
import type { ApplicationTarget } from "@/lib/ats";

function mailer(): { resend: Resend; from: string; to: string } {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !from || !to) {
    throw new Error("email-not-configured");
  }
  return { resend: new Resend(apiKey), from, to };
}

async function deliver(input: {
  to: string;
  subject: string;
  text: string;
  attachments?: { filename: string; content: Buffer }[];
}): Promise<void> {
  const { resend, from } = mailer();
  const { error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    attachments: input.attachments,
  });
  if (error) throw new Error("resend");
}

function promiseLine(): string {
  return t("thanks.responsePromise");
}

export async function sendEmployerInquiry(values: EmployerValues): Promise<void> {
  const { to } = mailer();
  const service = serviceLabel(values.service);
  const role = roleLabel(values.role);
  await deliver({
    to,
    subject: `Förfrågan: ${values.company} — ${service}`,
    text: [
      "Förfrågan från webbplatsen.",
      "",
      `Namn: ${values.name}`,
      `E-post: ${values.email}`,
      `Telefon: ${values.phone}`,
      `Företag: ${values.company}`,
      `Tjänst: ${service}`,
      `Roll: ${role}`,
      "",
      "Meddelande:",
      values.message,
    ].join("\n"),
  });
  try {
    await deliver({
      to: values.email,
      subject: "Vi har tagit emot din förfrågan",
      text: ["Hej,", "", "Vi har tagit emot din förfrågan.", "", promiseLine(), "", "Med vänlig hälsning", "Kandidator"].join("\n"),
    });
  } catch {
    // Inbox delivery already succeeded. Do not log the message body.
  }
}

async function sendSubmission(application: Submission): Promise<void> {
  const { to } = mailer();
  const attachment = {
    filename: application.cv.filename,
    content: Buffer.from(application.cv.bytes),
  };
  if (application.kind === "job") {
    await deliver({
      to,
      subject: `Ansökan: ${application.jobTitle} — ${application.name}`,
      text: [
        "Ansökan från webbplatsen.",
        "",
        `Annons: ${application.jobTitle}`,
        `Slug: ${application.jobSlug}`,
        `Namn: ${application.name}`,
        `E-post: ${application.email}`,
        `Telefon: ${application.phone}`,
        `LinkedIn: ${application.linkedin || "—"}`,
        "",
        "Meddelande:",
        application.message || "—",
        "",
        "CV bifogas.",
      ].join("\n"),
      attachments: [attachment],
    });
    try {
      await deliver({
        to: application.email,
        subject: "Vi har tagit emot din ansökan",
        text: ["Hej,", "", "Vi har tagit emot din ansökan.", "", promiseLine(), "", "Med vänlig hälsning", "Kandidator"].join("\n"),
      });
    } catch {
      // Confirmation is secondary.
    }
    return;
  }

  await deliver({
    to,
    subject: `Spontanansökan: ${roleLabel(application.role)} — ${application.name}`,
    text: [
      "Spontanansökan från webbplatsen.",
      "",
      `Roll: ${roleLabel(application.role)}`,
      `Önskad ort: ${application.location || "—"}`,
      `Namn: ${application.name}`,
      `E-post: ${application.email}`,
      `Telefon: ${application.phone}`,
      `LinkedIn: ${application.linkedin || "—"}`,
      "",
      "Meddelande:",
      application.message || "—",
      "",
      "CV bifogas.",
    ].join("\n"),
    attachments: [attachment],
  });
  try {
    await deliver({
      to: application.email,
      subject: "Vi har tagit emot din spontanansökan",
      text: ["Hej,", "", "Vi har tagit emot din spontanansökan.", "", promiseLine(), "", "Med vänlig hälsning", "Kandidator"].join("\n"),
    });
  } catch {
    // Confirmation is secondary.
  }
}

export const emailApplicationTarget: ApplicationTarget = {
  async submit(application) {
    await sendSubmission(application);
    try {
      await deletePrivateCv(application.cv.pathname);
    } catch {
      const { logForm } = await import("@/lib/log");
      logForm(application.kind === "job" ? "application" : "spontaneous", true, "blob-delete-failed");
    }
  },
};
