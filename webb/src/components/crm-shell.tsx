"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const onDesk = path === "/crm";

  return (
    <div className="crm-desk text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-white">
        <div className="mx-auto flex max-w-[88rem] items-center gap-4 px-4 py-3 sm:px-6">
          <Link href="/crm" className="flex shrink-0 items-baseline gap-2">
            <span className="text-[15px] font-semibold tracking-tight">VisaLight</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d6007a]">Sälj</span>
          </Link>
          <label className="ml-auto flex items-center gap-2 text-sm">
            <span className="sr-only">Inloggad som</span>
            <select
              value={store.userId}
              onChange={(event) => store.setUserId(event.target.value as StaffId)}
              aria-label="Inloggad som"
              className="h-9 rounded-lg border border-line bg-white px-2 text-sm text-ink"
            >
              {STAFF.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} · {ROLE_LABEL[person.role]}
                </option>
              ))}
            </select>
          </label>
          <Link href="/" className="text-sm text-muted hover:text-ink">
            Butiken
          </Link>
        </div>
        <nav aria-label="CRM" className="mx-auto flex max-w-[88rem] gap-1 overflow-x-auto px-2 sm:px-4">
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
          <Tab href="/crm/ring" pressed={active === "ring"} count={running}>
            Ringlistor
          </Tab>
          <Tab href="/crm/aktivitet" pressed={active === "aktivitet"} count={tasks}>
            Aktivitet
          </Tab>
          <Tab href="/crm/mallar" pressed={active === "mallar"}>
            Mallar
          </Tab>
          {store.isAdmin ? (
            <Tab href="/crm/admin" pressed={active === "admin"}>
              Admin
            </Tab>
          ) : null}
        </nav>
      </header>
      {!onDesk && (reminders.length || oppAlerts) ? (
        <div className="border-b border-line bg-white" role="status">
          <p className="mx-auto flex max-w-[88rem] flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 text-sm sm:px-6">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#d6007a]" aria-hidden="true" />
            {reminders.length ? (
              <span>
                {reminders.length} uppgift{reminders.length === 1 ? "" : "er"} att ta nu
              </span>
            ) : null}
            {oppAlerts ? (
              <span>
                {oppAlerts} möjlighet{oppAlerts === 1 ? "" : "er"} kräver uppföljning
              </span>
            ) : null}
            <Link href="/crm" className="font-semibold text-[#d6007a]">
              Öppna Idag
            </Link>
          </p>
        </div>
      ) : null}
      <main className="mx-auto max-w-[88rem] px-4 py-8 sm:px-6 sm:py-10">{children}</main>
      <p className="mx-auto max-w-[88rem] px-4 pb-10 text-xs leading-5 text-muted sm:px-6">
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
  children,
}: {
  href: string;
  pressed: boolean;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={pressed ? "page" : undefined}
      className={`inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm ${
        pressed ? "border-[#d6007a] font-semibold text-ink" : "border-transparent font-medium text-muted hover:text-ink"
      }`}
    >
      {children}
      {count ? <span className={`text-xs tabular-nums ${pressed ? "text-[#d6007a]" : "text-muted"}`}>{count}</span> : null}
    </Link>
  );
}
