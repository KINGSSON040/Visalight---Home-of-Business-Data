"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { STAFF, type StaffId, useCrmStore } from "@/lib/crm-store";

export function CrmFrame({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-paper" />}>
      <CrmFrameInner>{children}</CrmFrameInner>
    </Suspense>
  );
}

function CrmFrameInner({ children }: { children: React.ReactNode }) {
  const store = useCrmStore();
  const path = usePathname();
  const params = useSearchParams();
  const view = params.get("vy");
  const stars = store.claims.filter((item) => item.userId === store.userId).length;
  const active = path.startsWith("/crm/ring")
    ? "ring"
    : path.startsWith("/crm/bolag")
      ? "sok"
      : view === "mina"
        ? "mina"
        : view === "segment"
          ? "segment"
          : view === "aktivitet"
            ? "aktivitet"
            : "sok";

  return (
    <div className="min-h-dvh text-ink lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      <aside className="border-b border-line bg-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:block">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-sea">Internt</p>
            <p className="text-2xl tracking-tight">VisaLight</p>
            <p className="text-sm text-muted">CRM</p>
          </div>
          <Link href="/" className="text-sm text-sea lg:hidden">
            Till butiken
          </Link>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-3 pb-4 lg:flex-col lg:px-3">
          <ShellLink href="/crm" pressed={active === "sok"}>
            Sök bolag
          </ShellLink>
          <ShellLink href="/crm?vy=mina" pressed={active === "mina"}>
            Mina företag{stars ? ` · ${stars}` : ""}
          </ShellLink>
          <ShellLink href="/crm?vy=segment" pressed={active === "segment"}>
            Segment
          </ShellLink>
          <ShellLink href="/crm/ring" pressed={active === "ring"}>
            Ring
          </ShellLink>
          <ShellLink href="/crm?vy=aktivitet" pressed={active === "aktivitet"}>
            Aktivitet
          </ShellLink>
        </nav>
        <label className="mx-3 mb-4 block text-sm">
          <span className="mb-1.5 block text-muted">Säljare</span>
          <select
            value={store.userId}
            onChange={(event) => store.setUserId(event.target.value as StaffId)}
            className="h-10 w-full rounded-xl border border-line bg-paper px-2 text-sm text-ink"
          >
            {STAFF.map((person) => (
              <option key={person.id} value={person.id} className="text-ink">
                {person.name}
              </option>
            ))}
          </select>
          <span className="mt-1.5 block text-xs leading-5 text-muted">
            Exempelkonton. Byt säljare för att se någon annans stjärnor.
          </span>
        </label>
        <p className="mt-auto hidden px-5 py-5 text-sm leading-6 text-muted lg:block">
          Exempelbolag tills det riktiga registret är kopplat. Profiler kan strykas, inte raderas.
        </p>
      </aside>
      <main className="min-w-0 px-4 py-5 sm:px-6 sm:py-6">{children}</main>
    </div>
  );
}

function ShellLink({ href, pressed, children }: { href: string; pressed: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={pressed ? "page" : undefined}
      className={`whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm font-medium ${
        pressed ? "bg-sea text-white" : "bg-transparent text-ink/75 hover:bg-foam"
      }`}
    >
      {children}
    </Link>
  );
}
