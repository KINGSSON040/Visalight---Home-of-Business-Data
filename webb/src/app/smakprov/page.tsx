import type { Metadata } from "next";
import { BuilderLink } from "@/components/builder-link";
import { SampleForm } from "@/components/sample-form";
import { registerDatabasePath } from "@/lib/register-path";

export const metadata: Metadata = {
  title: "Smakprov — VisaLight",
  description: "Ange bransch med namn eller SNI-kod och få 30 bolag från bolagsregistret. Filen kan mailas till er.",
};

export default function SamplePage() {
  const connected = registerDatabasePath() !== null;
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.14em] text-ink uppercase">Kostnadsfritt smakprov</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">30 bolag i den bransch ni säljer till.</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
        Skriv branschens namn eller en SNI-kod. Filen innehåller 30 bolag i den branschen, med samma kolumner som ett köpt utdrag. Den kan mailas till e-postadressen ni anger.
      </p>
      {connected ? null : <p className="mt-4 text-sm font-semibold">Bolagsregistret är inte inkopplat. Ingen fil skapas förrän det är det.</p>}
      <SampleForm />
      <p className="mt-6 text-sm">
        <BuilderLink className="font-semibold text-ink underline-offset-4 hover:underline">Till listbyggaren</BuilderLink>
      </p>
    </main>
  );
}
