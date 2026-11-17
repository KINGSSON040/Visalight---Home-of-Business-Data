import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { Mark, SELLER } from "@/lib/seller";

export const metadata: Metadata = {
  title: "Köpvillkor — VisaLight",
  description:
    "Köpvillkor för utdrag av företagsregistret. Pris exklusive moms, lägsta order 399 kr, gästköp med kort eller faktura.",
  alternates: { canonical: "/villkor" },
};

export default function TermsPage() {
  return (
    <PageIntro
      eyebrow="Köpvillkor"
      title="Så köper ni ett utdrag."
      lead="VisaLight är ännu inte ett registrerat bolag. Beställning öppnar snart. Tills dess kan ni förhandsboka ett utdrag med e-post. Ingen betalning dras."
    >
      <section>
        <h2 className="text-2xl tracking-tight">Vem som säljer</h2>
        <p className="mt-2 leading-7 text-muted">
          {SELLER.tradeName} har inget organisationsnummer, ingen adress och inget momsregistreringsnummer ännu. De
          fylls i här när bolaget finns: <Mark>{SELLER.orgNr}</Mark>, <Mark>{SELLER.address}</Mark>,{" "}
          <Mark>{SELLER.vatNr}</Mark>.
        </p>
      </section>
      <section>
        <h2 className="text-2xl tracking-tight">Pris och moms</h2>
        <p className="mt-2 leading-7 text-muted">
          Priset ni ser i utdraget är exklusive moms. Grunduppgifter kostar 10 öre per bolag. Kontaktnummer kostar 30
          öre per nummer, e-postkontakt 40 öre per adress och beslutsfattare 40 öre per nummer. Ett tomt fält kostar
          inget. Lägsta order är 399 kr exklusive moms. Moms kan läggas till först när{" "}
          <Mark>{SELLER.vatNr}</Mark> finns.
        </p>
      </section>
      <section>
        <h2 className="text-2xl tracking-tight">Förhandsbokning</h2>
        <p className="mt-2 leading-7 text-muted">
          Beställning öppnar snart. Förhandsbokningen sparar urvalet och e-postadressen i den här webbläsaren. Ingen
          betalning dras och ingen fil skickas. Kort och faktura finns inte ännu.
        </p>
      </section>
      <section>
        <h2 className="text-2xl tracking-tight">Vad filen får användas till</h2>
        <p className="mt-2 leading-7 text-muted">
          Utdraget är till för er egen bearbetning av företag, till exempel sälj och marknad. Det får inte säljas
          vidare som ett eget register. Reklamspärrade bolag, avregistrerade bolag, konkurs och näringsförbud ingår
          inte. Ni ansvarar för hur ni kontaktar bolagen, inklusive NIX-Telefon när ett nummer omfattas av den spärren.
        </p>
      </section>
      <section>
        <h2 className="text-2xl tracking-tight">Hur färskt underlaget är</h2>
        <p className="mt-2 leading-7 text-muted">
          Filen tas från den senaste uppdateringen av företagsregistret. Äldre årgångar används inte. Det är inte en
          direktuppdatering varje minut. Datumet för senaste uppdatering visas på sidan.
        </p>
      </section>
    </PageIntro>
  );
}
