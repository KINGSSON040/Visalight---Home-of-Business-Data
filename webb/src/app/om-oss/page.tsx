import type { Metadata } from "next";
import { BuilderLink } from "@/components/builder-link";
import { OFFER_LINE, OFFER_WHY, SELLER, SellerFacts } from "@/lib/seller";

export const metadata: Metadata = {
  title: "Om oss — VisaLight",
  description: "Hitta er nästa kund idag. Det går för att uppgifterna är verifierade, uppdaterade och färska. Säte i Malmö.",
  alternates: { canonical: "/om-oss" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.14em] text-ink uppercase">Om oss</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">{OFFER_LINE}</h1>
      <p className="mt-4 text-lg leading-8 text-muted">{OFFER_WHY}</p>
      <p className="mt-4 leading-7 text-muted">
        Välj bransch och se priset innan ni hör av er. Inget konto krävs, och ingen prenumeration dras. {SELLER.line}
      </p>
      <section className="mt-10">
        <h2 className="text-2xl font-extrabold tracking-tight">Uppgifter</h2>
        <SellerFacts />
      </section>
      <BuilderLink className="btn-neon mt-10 inline-flex h-11 items-center rounded-lg px-5 text-sm font-semibold">
        Bygg din lista
      </BuilderLink>
    </main>
  );
}
