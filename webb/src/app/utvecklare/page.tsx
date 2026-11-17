import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "För utvecklare — VisaLight",
  description:
    "Den köpta filen är CSV med semikolon eller Excel. API och webhooks är inte öppna. Boka 15 minuter om ni ska koppla ett affärssystem.",
};

export default function DevelopersPage() {
  return (
    <PageIntro
      eyebrow="Utvecklare och analytiker"
      title="En fil med fasta kolumner, redo att läsas in."
      lead="Idag levereras urvalet som CSV eller Excel till e-posten efter betalning. Ett öppet API finns inte ännu."
    >
      <section>
        <h2 className="text-2xl tracking-tight">Så ser filen ut</h2>
        <p className="mt-2 leading-7 text-muted">
          Kolumnerna är organisationsnummer, företagsnamn, gatuadress, postnummer, postort, län, bolagsform, bransch,
          SNI, anställda, telefon, e-post och beslutsfattare. CSV-filen är UTF-8 med semikolon. Tomma fält är tomma
          strängar, inte gissade värden. Ladda ner smakprovet och testa inläsningen.
        </p>
      </section>
      <section>
        <h2 className="text-2xl tracking-tight">Koppling mot affärssystem</h2>
        <p className="mt-2 leading-7 text-muted">
          Webhooks och API är inte publicerade. Team som behöver ett återkommande uttag eller en inläsning i ett
          befintligt system bokar 15 minuter, så vi kan prata format innan något byggs.
        </p>
      </section>
    </PageIntro>
  );
}
