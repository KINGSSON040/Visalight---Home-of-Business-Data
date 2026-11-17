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
      lead="En lista är bara användbar om den speglar bolag som finns kvar. VisaLight byter ut registret vid varje synk och säljer bara aktiva bolag."
    >
      <section>
        <h2 className="text-2xl tracking-tight">SCB:s allmänna företagsregister</h2>
        <p className="mt-2 leading-7 text-muted">
          Namn, adress, ort, län, juridisk form, SNI och storleksklass hämtas från SCB. Det är samma officiella
          företagsregister som beskriver verksamma företag i Sverige, inklusive enskild firma.
        </p>
      </section>
      <section>
        <h2 className="text-2xl tracking-tight">Så ofta det uppdateras</h2>
        <p className="mt-2 leading-7 text-muted">
          Vi arbetar endast med aktuella uppgifter. Registret uppdateras vid varje ny synk mot SCB, och utdraget tas
          alltid från den senaste uppdateringen. Äldre register används inte. Det är inte en realtidsström. Nya bolag
          kommer med. Bolag som avregistrerats, är inaktiva eller har näringsförbud tas ur filen du köper.
        </p>
      </section>
      <section>
        <h2 className="text-2xl tracking-tight">Vad som inte gissas</h2>
        <p className="mt-2 leading-7 text-muted">
          Telefon, e-post och beslutsfattarnummer skrivs bara in när en angiven källa har värdet. Saknas det lämnas
          fältet tomt, och ett tomt fält kostar inget. Bolagsverket registrerar företaget, men uttaget till listan görs
          från SCB. Skatteverket är inte källa för filen.
        </p>
      </section>
    </PageIntro>
  );
}
