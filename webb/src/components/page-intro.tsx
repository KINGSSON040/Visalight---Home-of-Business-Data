import { BuilderLink } from "@/components/builder-link";

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
        <BuilderLink className="btn-neon inline-flex h-11 items-center rounded-lg px-5 text-sm font-semibold">
          Bygg din lista
        </BuilderLink>
      </div>
    </main>
  );
}
