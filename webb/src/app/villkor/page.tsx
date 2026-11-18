import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { SELLER } from "@/lib/seller";

export const metadata: Metadata = {
  title: "Köpvillkor — VisaLight",
  description:
    "Köpvillkor för utdrag av företagsregistret. Pris exklusive moms, lägsta order 399 kr. Beställning öppnar snart. Ingen betalning dras.",
  alternates: { canonical: "/villkor" },
};

export default function TermsPage() {
  return (
    <PageIntro
      eyebrow="Köpvillkor"
      title="Villkor för utdraget."
      lead={`${SELLER.line} Beställning öppnar snart. Tills dess kan ni förhandsboka ett utdrag med e-post. Ingen betalning dras.`}
    >
      <section>
        <h2 className="text-2xl tracking-tight">Vem som säljer</h2>
        <p className="mt-2 leading-7 text-muted">
          {SELLER.line}
        </p>
      </section>
      <section>
        <h2 className="text-2xl tracking-tight">Pris och moms</h2>
        <p className="mt-2 leading-7 text-muted">
          Priset ni ser i utdraget är exklusive moms. Grunduppgifter kostar 0,10 kr per bolag. Kontaktnummer kostar 0,30
          kr per nummer, e-postkontakt 0,40 kr per adress och beslutsfattare 0,40 kr per nummer. Ett tomt fält kostar
          inget. Lägsta order är 399 kr exklusive moms.
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
          Filen är uppdaterad företagsinformation från den senaste uppdateringen av företagsregistret. Äldre årgångar används inte. Det är inte en
          direktuppdatering varje minut. Datumet för senaste uppdatering visas på sidan. Det hänger ihop med att jobba med färsk information.
        </p>
      </section>
    </PageIntro>
  );
}
