"use client";

import { useEffect, useState } from "react";
import { selectionToQuery, type Selection } from "@/lib/catalog";

const FRAMES = [
  { word: "", bransch: "", city: "", phones: false, emails: false, label: "Börja tomt. Inget urval ännu.", companies: "–", phonesN: "–", emailsN: "–" },
  { word: "restaurang", bransch: "Restaurangverksamhet", city: "", phones: false, emails: false, label: "Skriv bransch. Antalet bolag kommer direkt.", companies: "bransch", phonesN: "nummer", emailsN: "adresser" },
  { word: "restaurang", bransch: "Restaurangverksamhet", city: "Malmö", phones: true, emails: false, label: "Lägg till ort och kontaktnummer.", companies: "urval", phonesN: "med nummer", emailsN: "utan e-post" },
  { word: "restaurang", bransch: "Restaurangverksamhet", city: "Malmö", phones: true, emails: true, label: "Kryssa i e-post. Priset följer med.", companies: "urval", phonesN: "med nummer", emailsN: "med e-post" },
];

export function UrvalWalkthrough({ onUse }: { onUse: (patch: Partial<Selection>) => void }) {
  const [frame, setFrame] = useState(0);
  const [typed, setTyped] = useState("");
  const [live, setLive] = useState<{ companies: number; phones: number; emails: number } | null>(null);
  const current = FRAMES[frame];

  useEffect(() => {
    const timer = window.setInterval(() => setFrame((value) => (value + 1) % FRAMES.length), 2800);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const target = current.word;
    setTyped("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(target.slice(0, index));
      if (index >= target.length) window.clearInterval(timer);
    }, 90);
    return () => window.clearInterval(timer);
  }, [current.word]);

  useEffect(() => {
    const selection: Selection = {
      query: "",
      city: current.city,
      county: "",
      bransch: current.bransch,
      sni: current.bransch ? "56110" : "",
      forms: [],
      employees: "",
      phones: current.phones,
      signatory: false,
      emails: current.emails,
    };
    const controller = new AbortController();
    fetch(`/api/urval?${selectionToQuery(selection)}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data: { companies?: number; phones?: number; emails?: number; status?: string }) => {
        if (data.status !== "ready") {
          setLive(null);
          return;
        }
        setLive({ companies: data.companies ?? 0, phones: data.phones ?? 0, emails: data.emails ?? 0 });
      })
      .catch(() => setLive(null));
    return () => controller.abort();
  }, [current.bransch, current.city, current.phones, current.emails]);

  return (
    <section id="sa-har" className="band-white">
      <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <h2 className="text-3xl tracking-tight">Så blir ett sökord ett urval</h2>
          <p className="mt-3 max-w-xl leading-7 text-muted">
            Skriv en bransch, välj ort och kryssa i tillvalen. Antalet bolag, nummer och e-postadresser ändras direkt.
            Prova samma sak i utdraget.
          </p>
          <ol className="mt-4 space-y-2 text-sm">
            {FRAMES.slice(1).map((item, index) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => setFrame(index + 1)}
                  className={`w-full rounded-2xl px-3 py-2 text-left ${frame === index + 1 ? "bg-foam font-medium" : "bg-paper"}`}
                >
                  {index + 1}. {item.label}
                </button>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() =>
              onUse({
                query: "",
                bransch: "Restaurangverksamhet",
                sni: "56110",
                city: "Malmö",
                phones: true,
                emails: true,
              })
            }
            className="btn-fade-sea mt-4 inline-flex h-12 items-center rounded-full bg-sea px-5 font-medium text-white"
          >
            Lägg exemplet i utdraget
          </button>
        </div>
        <div className="builder-card rounded-[1.35rem] p-4" aria-live="polite">
          <p className="text-xs font-medium text-muted">Sökord</p>
          <p className="mt-1 h-12 rounded-xl border border-line bg-paper px-3 py-3 text-lg">
            {typed}
            <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-sea align-middle" />
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {current.bransch ? <span className="rounded-full bg-foam px-2 py-1">{current.bransch}</span> : null}
            {current.city ? <span className="rounded-full bg-foam px-2 py-1">{current.city}</span> : null}
            {current.phones ? <span className="rounded-full bg-green-soft px-2 py-1 text-green">Kontaktnummer</span> : null}
            {current.emails ? <span className="rounded-full bg-green-soft px-2 py-1 text-green">E-postkontakt</span> : null}
          </div>
          <p className="mt-4 text-5xl font-semibold tracking-tight text-sea">{live ? live.companies.toLocaleString("sv-SE") : "–"}</p>
          <p className="text-sm text-muted">bolag i urvalet</p>
          <p className="mt-2 text-sm">
            {live ? `${live.phones.toLocaleString("sv-SE")} med nummer` : current.phonesN} ·{" "}
            {live ? `${live.emails.toLocaleString("sv-SE")} med e-post` : current.emailsN}
          </p>
          <p className="mt-3 text-sm leading-6">{current.label}</p>
          <a href="#urval" className="mt-3 inline-flex text-sm font-medium text-sea">
            Gå till utdraget
          </a>
        </div>
      </div>
    </section>
  );
}
