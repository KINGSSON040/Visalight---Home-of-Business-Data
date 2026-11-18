import type { Metadata } from "next";
import { DemoForm, type ContactKind } from "@/components/demo-form";

export const metadata: Metadata = {
  title: "Kontakt — VisaLight",
  description: "Skriv ett meddelande, boka tid eller boka möte. Telefonnumret läggs in när det finns. Inget skickas förrän en inkorg finns.",
};

function kindFrom(value: string | string[] | undefined): ContactKind {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "meddelande" || raw === "mote" || raw === "tid") return raw;
  return "tid";
}

const HEADING: Record<ContactKind, string> = {
  meddelande: "Skriv ett meddelande.",
  tid: "Boka en tid.",
  mote: "Boka ett möte.",
};

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const kind = kindFrom((await searchParams).arende);
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-sea">Kontakt</p>
      <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">{HEADING[kind]}</h1>
      <p className="mt-4 text-lg leading-8 text-muted">
        VisaLight säljer verifierad, uppdaterad och färsk företagsinformation. Telefon: numret läggs in när det finns. Meddelande och mötesönskemål sparas i den här webbläsaren tills en inkorg finns. Inget skickas ännu.
      </p>
      <div className="mt-8">
        <DemoForm kind={kind} />
      </div>
    </main>
  );
}
