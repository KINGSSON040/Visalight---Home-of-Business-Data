"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { COUNTIES, EMPLOYEE_BANDS, INDUSTRIES, countAudience } from "@/lib/catalog";

export function AudienceCounter() {
  const [sni, setSni] = useState("");
  const [county, setCounty] = useState("");
  const [employees, setEmployees] = useState("");
  const result = useMemo(() => countAudience({ sni, county, employees }), [sni, county, employees]);
  const headline =
    result.decisionMakers > 0
      ? `Vi hittade ${result.decisionMakers.toLocaleString("sv-SE")} beslutsfattare som matchar ditt urval.`
      : `Vi hittade ${result.companies.toLocaleString("sv-SE")} bolag som matchar ditt urval.`;

  return (
    <section id="raknare" className="border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-sea">Aktuellt urval</p>
        <h2 className="mt-3 max-w-3xl text-4xl tracking-tight">Se antalet innan du köper.</h2>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
          Välj bransch, län och antal anställda. Siffran ändras direkt och kommer från det register som är inkopplat
          just nu.
        </p>
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.7fr)]">
          <div className="grid gap-3 sm:grid-cols-3">
            <Select label="Bransch" value={sni} onChange={setSni}>
              <option value="">Alla branscher</option>
              {INDUSTRIES.map((item) => (
                <option key={item.sni} value={item.sni}>
                  {item.label}
                </option>
              ))}
            </Select>
            <Select label="Län" value={county} onChange={setCounty}>
              <option value="">Alla län</option>
              {COUNTIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <Select label="Anställda" value={employees} onChange={setEmployees}>
              <option value="">Alla storlekar</option>
              {EMPLOYEE_BANDS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
          <div className="rounded-3xl bg-sea-deep p-5 text-white" aria-live="polite">
            <p className="text-xs uppercase tracking-[0.16em] text-white/60">Träffar</p>
            <p className="mt-2 text-5xl tracking-tight">
              {(result.decisionMakers > 0 ? result.decisionMakers : result.companies).toLocaleString("sv-SE")}
            </p>
            <p className="mt-3 text-base leading-7">{headline}</p>
            <p className="mt-2 text-sm leading-6 text-white/70">
              {result.companies.toLocaleString("sv-SE")} bolag
              {result.decisionMakers > 0
                ? `, varav ${result.decisionMakers.toLocaleString("sv-SE")} med beslutsfattarnummer i källan.`
                : ". Inget beslutsfattarnummer finns i källan för det här urvalet."}{" "}
              Exempelregistret tills det riktiga uttaget från SCB är kopplat till sidan.
            </p>
            <Link href="/#urval" className="mt-5 inline-flex h-11 items-center rounded-full bg-amber px-4 font-medium text-ink">
              Bygg listan och se priset
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-line bg-paper px-3 text-base"
      >
        {children}
      </select>
    </label>
  );
}
