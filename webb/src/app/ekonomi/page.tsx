import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "För ekonomi — VisaLight",
  description:
    "Adress, organisationsnummer, SNI och storleksklass för aktiva bolag. Bokslut, anmärkningar och koncernstruktur ingår inte.",
};

export default function FinancePage() {
  return (
    <PageIntro
      eyebrow="Ekonomi och kredit"
      title="Rätt bolag och rätt adress, utan utlovade kredituppgifter."
      lead="Ekonomifunktionen använder listan för att nå aktiva bolag och stämma av grunduppgifter. Kreditbeslut kräver andra källor."
    >
      <section>
        <h2 className="text-2xl tracking-tight">Det som finns i filen</h2>
        <p className="mt-2 leading-7 text-muted">
          Organisationsnummer, juridiskt namn, besöksadress, ort, län, SNI och storleksklass när SCB har den.
          Uppgifterna byts ut vid varje synk, så en nedlagd motpart inte ligger kvar från förra årets export.
        </p>
      </section>
      <section>
        <h2 className="text-2xl tracking-tight">Det som inte ingår</h2>
        <p className="mt-2 leading-7 text-muted">
          Bokslut, nyckeltal, betalningsanmärkningar och koncernstruktur säljs inte i den här listan. De hör hemma hos
          en kreditupplysning. VisaLight är registret för att hitta och kontakta bolaget.
        </p>
      </section>
    </PageIntro>
  );
}
