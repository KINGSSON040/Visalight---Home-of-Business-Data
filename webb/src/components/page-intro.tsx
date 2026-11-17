import Link from "next/link";

export function PageIntro({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-sea">{eyebrow}</p>
      <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-4 text-lg leading-8 text-muted">{lead}</p>
      <div className="mt-8 space-y-8">{children}</div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/#urval" className="inline-flex h-12 items-center rounded-full bg-sea px-5 font-medium text-white">
          Skapa ert utdrag
        </Link>
      </div>
    </main>
  );
}
