import type { Metadata } from "next";
import { DemoForm } from "@/components/demo-form";

export const metadata: Metadata = {
  title: "Boka 15 minuter — VisaLight",
  description: "En kvarts samtal om filformat, återkommande uttag eller en senare koppling mot affärssystemet.",
};

export default function DemoPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-sea">För större urval</p>
      <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">15 minuter, utan abonnemang.</h1>
      <p className="mt-4 text-lg leading-8 text-muted">
        De flesta köper listan direkt i kassan. Boka ett kort samtal om ni ska läsa in filen i ett CRM, ta ut samma
        urval igen, eller prata om en senare koppling.
      </p>
      <div className="mt-8">
        <DemoForm />
      </div>
    </main>
  );
}
