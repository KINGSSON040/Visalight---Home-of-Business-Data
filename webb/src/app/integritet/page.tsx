import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { Mark, SELLER } from "@/lib/seller";

export const metadata: Metadata = {
  title: "Integritet — VisaLight",
  description:
    "Så behandlar VisaLight uppgifter om beställare och om bolagen i utdraget. B2B-prospektering, reklamspärr och gästköp.",
  alternates: { canonical: "/integritet" },
};

export default function IntegrityPage() {
  return (
    <PageIntro
      eyebrow="Integritet"
      title="Uppgifter om bolag, och om er beställning."
      lead="De flesta raderna i utdraget är uppgifter om ett företag. VisaLight är inte ett registrerat bolag ännu, så det finns ingen utsedd personuppgiftsansvarig med organisationsnummer."
    >
      <section>
        <h2 className="text-2xl tracking-tight">Ansvarig, när bolaget finns</h2>
        <p className="mt-2 leading-7 text-muted">
          Plats för uppgifterna: <Mark>{SELLER.orgNr}</Mark>, <Mark>{SELLER.address}</Mark>, <Mark>{SELLER.vatNr}</Mark>.
          Inget av det är ifyllt.
        </p>
      </section>
      <section>
        <h2 className="text-2xl tracking-tight">Utdraget</h2>
        <p className="mt-2 leading-7 text-muted">
          Namn, organisationsnummer, adress, ort, bransch och SNI kommer från den senaste uppdateringen av
          företagsregistret. Kontaktnummer, e-postkontakt och beslutsfattare följer med bara när uppgiften finns.
          Reklamspärrade bolag, avregistrerade bolag, konkurs och näringsförbud tas bort innan filen skapas.
        </p>
      </section>
      <section>
        <h2 className="text-2xl tracking-tight">Er beställning</h2>
        <p className="mt-2 leading-7 text-muted">
          En förhandsbokning ber bara om e-post. Den sparas i webbläsaren på den dator ni använder, inte hos en
          betalare, och skickas inte vidare. Vi säljer inte adressen.
        </p>
      </section>
      <section>
        <h2 className="text-2xl tracking-tight">Ert ansvar när ni hör av er</h2>
        <p className="mt-2 leading-7 text-muted">
          Syftet är att ett företag kontaktar ett annat företag. Ni ansvarar för utskicket, inklusive marknadsföringslagen
          och NIX-Telefon när numret omfattas. En kortare förklaring av samma gräns finns under{" "}
          <Link href="/gdpr" className="font-medium text-sea">
            personuppgifter
          </Link>
          .
        </p>
      </section>
    </PageIntro>
  );
}
