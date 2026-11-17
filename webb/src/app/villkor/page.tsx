import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";

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
      lead="Villkoren gäller beställning av företagsdata från VisaLight. De är skrivna för svenska företag som köper ett utdrag, inte ett abonnemang."
    >
      <section>
        <h2 className="text-2xl tracking-tight">Pris och moms</h2>
        <p className="mt-2 leading-7 text-muted">
          Priset ni ser i utdraget är exklusive moms. Grunduppgifter kostar 10 öre per bolag. Kontaktnummer kostar 30
          öre per nummer, e-postkontakt 40 öre per adress och beslutsfattare 40 öre per nummer. Ett tomt fält kostar
          inget. Lägsta order är 399 kr exklusive moms. Moms tillkommer på fakturan om säljaren är momsregistrerad.
        </p>
      </section>
      <section>
        <h2 className="text-2xl tracking-tight">Betalning och leverans</h2>
        <p className="mt-2 leading-7 text-muted">
          Ni betalar som gäst med kort eller faktura. Inget konto och ingen bindningstid. Filen levereras som CSV och
          Excel till e-postadressen ni anger. Ingen betalning dras förrän betalsättet är anslutet. Organisationsnummer
          och postadress för säljaren står på fakturaunderlaget.
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
