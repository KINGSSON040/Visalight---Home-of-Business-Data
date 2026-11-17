import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-sea">404</p>
      <h1 className="mt-3 text-4xl tracking-tight">Sidan finns inte.</h1>
      <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
        Adressen leder ingenstans. Utdraget finns kvar på startsidan, med samma färska register.
      </p>
      <Link href="/#urval" className="btn-fade-sea mt-8 inline-flex h-12 items-center rounded-full px-5 font-medium text-white">
        Skapa ert utdrag
      </Link>
    </main>
  );
}
