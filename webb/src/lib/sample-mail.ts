export type MailResult = {
  sent: boolean;
  missing: string[];
  error: string;
};

/** Skickar bara när både nyckel och avsändare finns. Utan nyckel görs inget anrop. */
export async function sendSampleMail(input: {
  to: string;
  firstName: string;
  label: string;
  csv: string;
  count: number;
}): Promise<MailResult> {
  const key = process.env.VISALIGHT_MAIL_KEY?.trim() ?? "";
  const from = process.env.VISALIGHT_MAIL_FROM?.trim() ?? "";
  const missing = [key ? "" : "VISALIGHT_MAIL_KEY", from ? "" : "VISALIGHT_MAIL_FROM"].filter(Boolean);
  if (missing.length > 0) return { sent: false, missing, error: "" };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: `Smakprov från VisaLight: ${input.label}`,
      text: `Hej ${input.firstName},\n\nHär är ${input.count} bolag i ${input.label}. Filen har fasta kolumner och tomma fält är tomma.\n\nVisaLight`,
      attachments: [
        {
          filename: "visalight-smakprov.csv",
          content: Buffer.from(input.csv, "utf8").toString("base64"),
        },
      ],
    }),
  });
  if (!response.ok) {
    return { sent: false, missing: [], error: "Mailservern tog inte emot filen." };
  }
  return { sent: true, missing: [], error: "" };
}
