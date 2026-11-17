"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/logo-mark";
import { ROLE_LABEL, STAFF, isOppClosed, type StaffId, useCrmStore } from "@/lib/crm-store";

type TabId = "idag" | "kunder" | "sok" | "segment" | "pipeline" | "ring" | "aktivitet" | "mallar" | "admin";

function activeTab(path: string): TabId | null {
  if (path.startsWith("/crm/sok")) return "sok";
  if (path.startsWith("/crm/segment")) return "segment";
  if (path.startsWith("/crm/ring")) return "ring";
  if (path.startsWith("/crm/aktivitet")) return "aktivitet";
  if (path.startsWith("/crm/pipeline")) return "pipeline";
  if (path.startsWith("/crm/mallar")) return "mallar";
  if (path.startsWith("/crm/admin")) return "admin";
  if (path.startsWith("/crm/kunder")) return "kunder";
  if (path === "/crm") return "idag";
  return null;
}

export function CrmFrame({ children }: { children: React.ReactNode }) {
  const store = useCrmStore();
  const path = usePathname();
  const active = activeTab(path);
  const mine = store.claims.filter((item) => item.userId === store.userId).length;
  const segments = store.segments.filter((item) => !item.archived).length;
  const tasks = store.openTasks(store.userId).length;
  const reminders = store.dueReminders(store.userId);
  const oppAlerts = store.opportunityAlerts(store.userId).length;
  const openOpps = store.opps.filter((item) => item.ownerId === store.userId && !isOppClosed(item.stage)).length;
  const running = store.callLists.filter((item) => !item.archived && item.orgNrs.some((org) => !item.results[org])).length;

  return (
    <div className="min-h-dvh text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-white shadow-sm">
        <div className="mx-auto flex max-w-[88rem] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/crm" className="flex shrink-0 items-center gap-2.5">
            <LogoMark className="h-8 w-8 shrink-0" />
            <span>
              <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-sea">Internt</span>
              <span className="block text-xl leading-tight tracking-tight">VisaLight CRM</span>
            </span>
          </Link>

          <nav aria-label="CRM" className="order-3 flex w-full gap-2 overflow-x-auto pb-1 lg:order-none lg:w-auto lg:flex-1 lg:pb-0">
            <Tab href="/crm" pressed={active === "idag"} count={reminders.length}>
              Idag
            </Tab>
            <Tab href="/crm/kunder" pressed={active === "kunder"} count={mine}>
              Mina kunder
            </Tab>
            <Tab href="/crm/sok" pressed={active === "sok"}>
              Sök &amp; segment
            </Tab>
            <Tab href="/crm/segment" pressed={active === "segment"} count={segments}>
              Mina segment
            </Tab>
            <Tab href="/crm/pipeline" pressed={active === "pipeline"} count={openOpps}>
              Pipeline
            </Tab>
            <span className="mx-1 hidden w-px self-stretch bg-line lg:block" aria-hidden="true" />
            <Tab href="/crm/ring" pressed={active === "ring"} count={running} quiet>
              Ringlistor
            </Tab>
            <Tab href="/crm/aktivitet" pressed={active === "aktivitet"} count={tasks} quiet>
              Aktivitet
            </Tab>
            <Tab href="/crm/mallar" pressed={active === "mallar"} quiet>
              Mallar
            </Tab>
            {store.isAdmin ? (
              <Tab href="/crm/admin" pressed={active === "admin"} quiet>
                Admin
              </Tab>
            ) : null}
          </nav>

          <label className="ml-auto flex items-center gap-2 text-sm">
            <span className="hidden font-medium 2xl:inline">Inloggad som</span>
            <select
              value={store.userId}
              onChange={(event) => store.setUserId(event.target.value as StaffId)}
              aria-label="Inloggad som"
              className="h-10 rounded-xl border border-line bg-paper px-2 text-sm text-ink"
            >
              {STAFF.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} · {ROLE_LABEL[person.role]}
                </option>
              ))}
            </select>
          </label>
          <Link href="/" className="hidden text-sm text-sea 2xl:block">
            Till butiken
          </Link>
        </div>
      </header>
      {reminders.length || oppAlerts ? (
        <div className="bg-rust text-white" role="status">
          <p className="mx-auto flex max-w-[88rem] flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-sm font-semibold sm:px-6">
            {reminders.length ? <span>{reminders.length} uppgift{reminders.length === 1 ? "" : "er"} har förfallit eller ska göras nu.</span> : null}
            {oppAlerts ? <span>{oppAlerts} möjlighet{oppAlerts === 1 ? "" : "er"} kräver uppföljning.</span> : null}
            <Link href="/crm" className="underline">
              Öppna Idag
            </Link>
          </p>
        </div>
      ) : null}
      <main className="mx-auto max-w-[88rem] px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      <p className="mx-auto max-w-[88rem] px-4 pb-8 text-xs leading-5 text-muted sm:px-6">
        Exempelbolag och exempelkonton tills registret och inloggningen är kopplade. Personer, nummer, segment och listor
        stryks eller arkiveras, de raderas inte.
      </p>
    </div>
  );
}

function Tab({
  href,
  pressed,
  count,
  quiet = false,
  children,
}: {
  href: string;
  pressed: boolean;
  count?: number;
  quiet?: boolean;
  children: React.ReactNode;
}) {
  const on = pressed ? "btn-fade-sea bg-sea text-white" : quiet ? "bg-transparent text-ink/75 hover:bg-foam" : "bg-foam text-ink hover:bg-foam/70";
  return (
    <Link
      href={href}
      aria-current={pressed ? "page" : undefined}
      className={`inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3.5 text-sm font-semibold ${on}`}
    >
      {children}
      {count ? (
        <span className={`rounded-full px-1.5 text-xs font-bold ${pressed ? "bg-white/25 text-white" : "bg-sea text-white"}`}>{count}</span>
      ) : null}
    </Link>
  );
}
