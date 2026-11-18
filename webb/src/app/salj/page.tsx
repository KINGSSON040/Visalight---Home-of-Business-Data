import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "För sälj och marknad — VisaLight",
  description:
    "Hitta er nästa kund i sälj och marknad idag. Välj bransch, län och storlek. Listan är färsk för att den tas från den senaste uppdateringen.",
};

export default function SalesPage() {
  return (
    <PageIntro
      eyebrow="Säljare och marknadschefer"
      title="En lista att ringa, mejla och segmentera i dag."
      lead="Hitta nästa kund på bransch och län. Se hur många träffar det blir, och betala för de kontaktfält som faktiskt är ifyllda. Listan är färsk för att den tas från den senaste uppdateringen."
    >
      <section>
        <h2 className="text-2xl tracking-tight">Prospektering utan gamla bolag</h2>
        <p className="mt-2 leading-7 text-muted">
          Filen innehåller aktiva bolag från senaste uttaget. Den som gått i konkurs eller avregistrerats sedan förra
          synken är inte kvar, så säljaren lägger inte tid på nummer som inte leder någonstans.
        </p>
      </section>
      <section>
        <h2 className="text-2xl tracking-tight">Segment som går att förklara</h2>
        <p className="mt-2 leading-7 text-muted">
          Bransch via SNI, län, ort och antal anställda. Samma urval kan bli en ringlista, ett mejlutskick eller en
          målgrupp. Beslutsfattarnumret kostar 40 öre och e-post 40 öre, bara när fältet har ett värde.
        </p>
      </section>
    </PageIntro>
  );
}
