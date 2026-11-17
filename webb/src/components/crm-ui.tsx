"use client";

import { useCrmStore, type Claim } from "@/lib/crm-store";

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
      className={`inline-flex ${box} shrink-0 items-center justify-center rounded-full border-2 ${
        filled ? "border-amber bg-amber-soft text-amber" : "border-line bg-white text-muted hover:border-amber hover:text-amber"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <svg viewBox="0 0 24 24" className={size === "lg" ? "h-8 w-8" : "h-6 w-6"} aria-hidden="true">
        <path
          d="M12 3.2 14.7 8.7 20.8 9.6 16.4 13.8 17.4 19.8 12 17 6.6 19.8 7.6 13.8 3.2 9.6 9.3 8.7 12 3.2Z"
          fill={filled ? "currentColor" : "none"}
          stroke={filled ? "#b58900" : "currentColor"}
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
    return <span className="rounded-full bg-green-soft px-2 py-0.5 text-xs font-medium text-green">Ledigt</span>;
  }
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        mine ? "bg-amber-soft text-ink" : "bg-rust/10 text-rust"
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
      disabled={taken}
      label={taken && claim ? `Bearbetas av ${claim.userName}` : mine ? "Ta bort stjärnan" : "Lägg i Mina företag"}
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
