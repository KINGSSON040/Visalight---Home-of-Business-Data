import type { Metadata } from "next";
import { AccountForm } from "@/components/account-form";

export const metadata: Metadata = {
  title: "Konto för köphistorik — VisaLight",
  description: "Ett konto är valfritt och bara till för köphistorik. Utdraget går att köpa utan konto.",
  robots: { index: false, follow: true },
};

export default function AccountPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-12 sm:py-16">
      <p className="text-xs font-semibold tracking-[0.14em] text-ink uppercase">Valfritt</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em]">Konto för köphistorik</h1>
      <p className="mt-4 text-base leading-7 text-muted">
        Inget konto krävs för att köpa. Skapa ett bara om ni vill se tidigare utdrag samlade.
      </p>
      <div className="mt-8">
        <AccountForm />
      </div>
    </main>
  );
}
