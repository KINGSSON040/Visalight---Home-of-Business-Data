"use client";

/** Två kolumner för ringlistans fokusläge: kundkortet till vänster, kön till höger. */
export function CrmWorkspace({ children, rail }: { children: React.ReactNode; rail: React.ReactNode }) {
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_21rem]">
      <div className="min-w-0">{children}</div>
      <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto">{rail}</aside>
    </div>
  );
}
