import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { Mark, SELLER } from "@/lib/seller";

export const metadata: Metadata = {
  title: "Cookies — VisaLight",
  description:
    "VisaLight använder inga marknadsföringscookies. En förhandsbokning sparas i webbläsaren. Ingen betalning dras.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <PageIntro
      eyebrow="Cookies"
      title="Inga annonscookies."
      lead="Sidan sätter inte cookies för annonser, mätning av besökare eller återmarknadsföring."
    >
      <section>
        <h2 className="text-2xl tracking-tight">Det som kan sparas i webbläsaren</h2>
        <p className="mt-2 leading-7 text-muted">
          En förhandsbokning kan spara urvalet och e-postadressen i webbläsarens egen lagring på den dator ni använder.
          Det är inte ett kvitto. Ingen betalning dras och ingen fil skickas. CRM-läget kan spara stjärnor och
          anteckningar på samma sätt. Inget av det följer med till en annan dator, och det används inte för att visa
          annonser.
        </p>
      </section>
      <section>
        <h2 className="text-2xl tracking-tight">Om det ändras</h2>
        <p className="mt-2 leading-7 text-muted">
          Om en betaltjänst senare behöver en cookie står det här. Ansvarig för sidan är ännu inte ett bolag:{" "}
          <Mark>{SELLER.orgNr}</Mark>, <Mark>{SELLER.address}</Mark>, <Mark>{SELLER.vatNr}</Mark>.
        </p>
      </section>
    </PageIntro>
  );
}
