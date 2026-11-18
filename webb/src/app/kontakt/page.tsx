import type { Metadata } from "next";
import { DemoForm, type ContactKind } from "@/components/demo-form";
import { SELLER, SellerFacts } from "@/lib/seller";

export const metadata: Metadata = {
  title: "Kontakt — VisaLight",
  description: "Hitta er nästa kund idag. Skriv ett meddelande eller boka tid. Inget skickas förrän en inkorg finns.",
  alternates: { canonical: "/kontakt" },
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

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const kind = kindFrom((await searchParams).arende);
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.14em] text-ink uppercase">Kontakt</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">{HEADING[kind]}</h1>
      <p className="mt-4 text-lg leading-8 text-muted">
        Hitta er nästa kund idag. Skriv om ni vill ha hjälp med urvalet. Meddelandet sparas i den här webbläsaren tills en inkorg finns. Inget skickas ännu. {SELLER.line}
      </p>
      <SellerFacts />
      <div className="mt-8">
        <DemoForm kind={kind} />
      </div>
    </main>
  );
}
