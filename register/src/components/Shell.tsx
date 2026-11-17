import Link from "next/link";

const links = [
  { href: "/", label: "Översikt" },
  { href: "/foretag", label: "Företag" },
  { href: "/segment", label: "Segment" },
  { href: "/uppdatering", label: "Uppdatering" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Visalight
          </Link>
          <nav className="flex gap-1 text-sm">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-full px-3 py-1.5 hover:bg-[var(--paper)]">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}
