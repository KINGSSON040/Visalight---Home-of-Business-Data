import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "Personuppgifter — VisaLight",
  description:
    "Så hanterar VisaLight företagsdata och personuppgifter för B2B-prospektering. Reklamspärrade och avregistrerade bolag följer inte med i filen.",
};

export default function PrivacyPage() {
  return (
    <PageIntro
      eyebrow="Tryggt att prospektera"
      title="Företagsuppgifter för B2B, med det som är personuppgift märkt."
      lead="De flesta raderna är uppgifter om ett företag. Ett direktnummer till en person, eller en enskild firma, kan samtidigt vara en personuppgift. Där är vi restriktiva."
    >
      <section>
        <h2 className="text-2xl tracking-tight">Vad som får följa med</h2>
        <p className="mt-2 leading-7 text-muted">
          En köpt fil innehåller aktiva bolag med organisationsnummer, namn, adress, ort och SNI. Kontaktfält följer
          med bara när källan har dem. Reklamspärrade bolag, avregistrerade bolag, konkurs och näringsförbud hålls
          utanför filen.
        </p>
      </section>
      <section>
        <h2 className="text-2xl tracking-tight">Varför det kan användas i B2B</h2>
        <p className="mt-2 leading-7 text-muted">
          Syftet är att ett företag ska kunna kontakta ett annat företag om en vara eller tjänst. Det är
          prospektering, inte konsumentreklam. Kunden ansvarar för sitt eget utskick, inklusive NIX och de regler som
          gäller just den kanalen.
        </p>
      </section>
      <section>
        <h2 className="text-2xl tracking-tight">Inget konto för att köpa</h2>
        <p className="mt-2 leading-7 text-muted">
          Beställningen görs som gäst. Vi behöver e-postadressen dit filen ska, och företagsuppgifterna på den som
          betalar. De används för ordern, inte för ett abonnemang. Den här texten är en förklaring, inte juridisk
          rådgivning.
        </p>
      </section>
    </PageIntro>
  );
}
