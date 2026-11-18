import { pickSample } from "@/lib/sample-pick";
import { sendSampleMail } from "@/lib/sample-mail";

type Body = {
  company?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  industry?: string;
  sni?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;
  const company = body?.company?.trim() ?? "";
  const firstName = body?.firstName?.trim() ?? "";
  const lastName = body?.lastName?.trim() ?? "";
  const email = body?.email?.trim() ?? "";
  const industry = body?.industry?.trim() ?? "";
  const errors: Record<string, string> = {};
  if (company.length < 2) errors.company = "Ange företaget.";
  if (firstName.length < 2) errors.firstName = "Ange förnamn.";
  if (lastName.length < 2) errors.lastName = "Ange efternamn.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Ange en e-postadress.";
  if (industry.length < 2 && !(body?.sni ?? "").replace(/\D/g, "")) errors.industry = "Ange bransch med namn eller SNI-kod.";
  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, errors }, { status: 400 });
  }

  const sample = pickSample(industry, body?.sni);
  if (!sample.ok) {
    return Response.json({ ok: false, note: sample.note, mailed: false }, { status: 422 });
  }

  const mail = await sendSampleMail({
    to: email,
    firstName,
    label: sample.label,
    csv: sample.csv,
    count: sample.count,
  });
  return Response.json({
    ok: true,
    note: sample.note,
    count: sample.count,
    csv: sample.csv,
    mailed: mail.sent,
    missing: mail.missing,
    mailError: mail.error,
    to: email,
    name: `${firstName} ${lastName}`,
    company,
  });
}
