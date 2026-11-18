import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "Källor och uppdatering — VisaLight",
  description:
    "Grunduppgifterna hämtas från SCB:s allmänna företagsregister och byts ut vid varje synk. Kontaktfält lämnas tomma när källan saknar dem.",
};

export default function SourcesPage() {
  return (
    <PageIntro
      eyebrow="Var uppgiften kommer ifrån"
      title="Aktuella bolag, från senaste uttaget."
      lead="En lista är bara användbar om den speglar bolag som finns kvar. VisaLight synkar registret en gång i veckan och säljer bara aktiva bolag."
    >
      <section>
        <h2 className="text-2xl tracking-tight">SCB:s allmänna företagsregister</h2>
        <p className="soft-copy mt-2 text-muted">
          Namn, adress, ort, län, juridisk form, SNI och storleksklass hämtas från SCB. Det är samma officiella
          företagsregister som beskriver verksamma företag i Sverige, inklusive enskild firma.
        </p>
      </section>
      <section>
        <h2 className="text-2xl tracking-tight">Så ofta det uppdateras</h2>
        <p className="soft-copy mt-2 text-muted">
          Registret synkas en gång i veckan. Utdraget tas alltid från den senaste uppdateringen. Äldre register används
          inte. Nya bolag kommer med. Vilande, inaktiva, avregistrerade och reklamspärrade bolag tas ur filen, och de
          ingår inte i siffran. Siffran följer den senaste uppdateringen.
        </p>
      </section>
      <section>
        <h2 className="text-2xl tracking-tight">Vad som inte gissas</h2>
        <p className="soft-copy mt-2 text-muted">
          Telefon, e-post och beslutsfattarnummer skrivs bara in när en angiven källa har värdet. Saknas det lämnas
          fältet tomt, och ett tomt fält kostar inget. Bolagsverket registrerar företaget, och uttaget görs från SCB.
        </p>
      </section>
    </PageIntro>
  );
}
