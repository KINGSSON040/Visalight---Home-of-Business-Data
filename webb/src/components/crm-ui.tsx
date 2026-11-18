"use client";

import { useRouter } from "next/navigation";
import { FLAGS, formatStamp, stageInfo, useCrmStore, type Claim, type StageId } from "@/lib/crm-store";
import type { Company } from "@/lib/catalog";

export function StarButton({
  filled,
  disabled,
  label,
  onClick,
  size = "md",
}: {
  filled: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  size?: "md" | "lg";
}) {
  const box = size === "lg" ? "h-14 w-14" : "h-11 w-11";
  return (
    <button
      type="button"
      aria-pressed={filled}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex ${box} shrink-0 items-center justify-center rounded-full border ${
        filled ? "border-[#1c1917] bg-[#1c1917] text-white" : "border-line bg-white text-muted hover:border-[#1c1917] hover:text-ink"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <svg viewBox="0 0 24 24" className={size === "lg" ? "h-8 w-8" : "h-6 w-6"} aria-hidden="true">
        <path
          d="M12 3.2 14.7 8.7 20.8 9.6 16.4 13.8 17.4 19.8 12 17 6.6 19.8 7.6 13.8 3.2 9.6 9.3 8.7 12 3.2Z"
          fill={filled ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function useOwner(orgNr: string): { claim: Claim | null; mine: boolean; taken: boolean } {
  const store = useCrmStore();
  const claim = store.claims.find((item) => item.orgNr === orgNr) ?? null;
  const mine = claim?.userId === store.userId;
  return { claim, mine, taken: Boolean(claim && !mine) };
}

export function OwnerChip({ orgNr }: { orgNr: string }) {
  const { claim, mine } = useOwner(orgNr);
  if (!claim) {
    return <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-muted ring-1 ring-inset ring-line">Ledigt</span>;
  }
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        mine ? "bg-white text-ink ring-1 ring-inset ring-[#d6007a]/40" : "bg-white text-muted ring-1 ring-inset ring-line"
      }`}
    >
      {mine ? "Ditt" : `Bearbetas av ${claim.userName}`}
    </span>
  );
}

export function OwnerStar({ orgNr, size = "md" }: { orgNr: string; size?: "md" | "lg" }) {
  const store = useCrmStore();
  const { claim, mine, taken } = useOwner(orgNr);
  return (
    <StarButton
      size={size}
      filled={Boolean(claim)}
      disabled={taken && !store.isAdmin}
      label={
        taken && claim
          ? store.isAdmin
            ? `Släpp ${claim.userName}s bolag (admin)`
            : `Bearbetas av ${claim.userName}`
          : mine
            ? "Ta bort stjärnan"
            : "Lägg i Mina kunder"
      }
      onClick={() => store.toggleStar(orgNr)}
    />
  );
}

export function Panel({
  title,
  intro,
  aside,
  children,
  id,
}: {
  title: string;
  intro?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="mt-4 rounded-3xl border border-line bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl tracking-tight">{title}</h2>
          {intro ? <p className="mt-1 text-sm leading-6 text-muted">{intro}</p> : null}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-line bg-paper px-3"
      />
    </label>
  );
}

export function telHref(value: string): string {
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}

export function kundHref(orgNr: string): string {
  return `/crm/kund/${encodeURIComponent(orgNr)}`;
}

export function BackLink({ fallback = "/crm", label = "Tillbaka" }: { fallback?: string; label?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1 && document.referrer.startsWith(window.location.origin)) {
          router.back();
        } else {
          router.push(fallback);
        }
      }}
      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-white px-4 text-sm font-semibold text-sea hover:bg-foam"
    >
      <span aria-hidden="true">←</span> {label}
    </button>
  );
}

export function StageChip({ stage }: { stage: StageId | string }) {
  const info = stageInfo(stage);
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${info.chip}`}>{info.label}</span>;
}

export function isSoleProprietor(company: Company): boolean {
  return company.form === "ef";
}

export function CompanyWarnings({ company, compact = false }: { company: Company; compact?: boolean }) {
  const store = useCrmStore();
  const meta = store.metaOf(company.orgNr);
  const items = [
    ...meta.flags.map((entry) => {
      const flag = FLAGS.find((item) => item.id === entry.id);
      return {
        key: entry.id,
        label: flag?.label ?? entry.id,
        detail: `${flag?.detail ?? ""} Satt ${formatStamp(entry.at)} av ${entry.by}.`,
        tone: "bad" as const,
      };
    }),
    ...(isSoleProprietor(company)
      ? [
          {
            key: "ef",
            label: "Enskild firma · GDPR-känslig",
            detail:
              "Organisationsnumret är ofta ägarens personnummer. Det maskeras i export. Kontakta bara i affärssyfte och respektera invändningar direkt.",
            tone: "warn" as const,
          },
        ]
      : []),
  ];
  if (items.length === 0) return null;
  if (compact) {
    return (
      <>
        {items.map((item) => (
          <span
            key={item.key}
            title={item.detail}
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${item.tone === "bad" ? "bg-white text-ink ring-[#1c1917]" : "bg-white text-muted ring-line"}`}
          >
            {item.label}
          </span>
        ))}
      </>
    );
  }
  return (
    <div className="mt-3 space-y-2" role="alert">
      {items.map((item) => (
        <div
          key={item.key}
          className={`rounded-2xl border border-line bg-white px-4 py-3 text-sm leading-6 ${
            item.tone === "bad" ? "shadow-[inset_3px_0_0_#d6007a]" : ""
          }`}
        >
          <p className="font-semibold">
            {item.tone === "bad" ? "Spärr: " : "Varning: "}
            {item.label}
          </p>
          <p>{item.detail}</p>
        </div>
      ))}
    </div>
  );
}

