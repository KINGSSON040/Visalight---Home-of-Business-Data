"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  COMPANIES,
  ORDER_STORAGE_KEY,
  defaultSelection,
  filterCompanies,
  type Company,
  type OrderDraft,
  type Selection,
} from "@/lib/catalog";

export type Role = "admin" | "saljare";

export const STAFF = [
  { id: "anna", name: "Anna Berg", role: "admin" as Role },
  { id: "erik", name: "Erik Holm", role: "saljare" as Role },
  { id: "mira", name: "Mira Lind", role: "saljare" as Role },
] as const;

export type StaffId = (typeof STAFF)[number]["id"];

export const ROLE_LABEL: Record<Role, string> = { admin: "Admin", saljare: "Säljare" };

export type Claim = {
  orgNr: string;
  userId: StaffId;
  userName: string;
  at: string;
};

export type Segment = {
  id: string;
  name: string;
  query: string;
  city: string;
  county: string;
  bransch: string;
  sni: string;
  forms: string[];
  employees: string;
  /** Satt för ett fast segment som är handplockat. Tomt betyder att filtret styr. */
  orgNrs?: string[];
  createdBy: string;
  createdAt: string;
  archived: boolean;
};

export type ContactPhone = { id: string; value: string; struck: boolean };
export type ContactEmail = { id: string; value: string; struck: boolean };

export type Contact = {
  id: string;
  orgNr: string;
  firstName: string;
  lastName: string;
  role: string;
  phones: ContactPhone[];
  emails: ContactEmail[];
  struck: boolean;
  struckAt: string;
  struckBy: string;
  createdAt: string;
  createdBy: string;
};

export type OutcomeTone = "good" | "warm" | "neutral" | "bad";

export const OUTCOMES = [
  { id: "ej-svar", label: "Ringde · ej svar", short: "Ej svar", tone: "neutral", call: true, key: "1" },
  { id: "upptaget", label: "Ringde · upptaget", short: "Upptaget", tone: "neutral", call: true, key: "2" },
  { id: "svar", label: "Ringde · svar", short: "Svar", tone: "good", call: true, key: "3" },
  { id: "ring-igen", label: "Ringde · ring igen", short: "Ring igen", tone: "warm", call: true, key: "4" },
  { id: "intresserad", label: "Intresserad", short: "Intresserad", tone: "good", call: true, key: "5" },
  { id: "mote", label: "Möte bokat", short: "Möte bokat", tone: "good", call: true, key: "6" },
  { id: "offert", label: "Offert skickad", short: "Offert", tone: "good", call: true, key: "7" },
  { id: "ej-intresserad", label: "Nej tack", short: "Nej tack", tone: "bad", call: true, key: "8" },
  { id: "fel-person", label: "Ringde · fel person", short: "Fel person", tone: "neutral", call: true, key: "9" },
  { id: "fel-nummer", label: "Ringde · fel nummer", short: "Fel nummer", tone: "bad", call: true, key: "0" },
  { id: "inaktivt-nummer", label: "Ringde · inaktivt nummer", short: "Inaktivt nummer", tone: "bad", call: true, key: "i" },
  { id: "sparr", label: "Spärr · vill inte bli kontaktad", short: "Spärr", tone: "bad", call: true, key: "p" },
  { id: "mailat", label: "Mailat", short: "Mailat", tone: "neutral", call: false, key: "" },
  { id: "sms", label: "SMS skickat", short: "SMS", tone: "neutral", call: false, key: "" },
  { id: "social", label: "Sociala medier", short: "Sociala medier", tone: "neutral", call: false, key: "" },
  { id: "anteckning", label: "Anteckning", short: "Anteckning", tone: "neutral", call: false, key: "" },
] as const;

export const SYSTEM_EVENTS = {
  "agare-satt": "Stjärnmärkte bolaget",
  "agare-slappt": "Tog bort stjärnan",
  status: "Ändrade status",
  "sparr-satt": "Satte spärr",
  "sparr-borttagen": "Tog bort spärr",
  tagg: "Ändrade taggar",
  "kontakt-ny": "Lade till kontaktperson",
  "kontakt-struken": "Strök kontaktperson",
  "kontakt-aterstalld": "Återställde kontaktperson",
  "uppgift-ny": "Skapade uppgift",
  "uppgift-klar": "Slutförde uppgift",
  utkast: "Sparade utkast",
  "mojlighet-ny": "Skapade möjlighet",
  "mojlighet-fas": "Flyttade möjlighet",
  "mojlighet-andrad": "Ändrade möjlighet",
} as const;

export type OutcomeId = (typeof OUTCOMES)[number]["id"];
export type SystemEventId = keyof typeof SYSTEM_EVENTS;
export type ActivityKind = OutcomeId | SystemEventId;

export function isSystemKind(kind: string): kind is SystemEventId {
  return kind in SYSTEM_EVENTS;
}

export type Activity = {
  id: string;
  orgNr: string;
  companyName: string;
  at: string;
  userId: StaffId;
  userName: string;
  outcome: ActivityKind;
  note: string;
  nextAt: string;
  nextNote: string;
  struckPhone: string;
  contactName?: string;
  contactId?: string;
};

export type Purchase = {
  id: string;
  orgNr: string;
  at: string;
  what: string;
  sum: string;
};

export type CallResult = { outcome: OutcomeId | "hoppade"; at: string };

export type CallList = {
  id: string;
  name: string;
  source: string;
  orgNrs: string[];
  results: Record<string, CallResult>;
  createdBy: string;
  createdAt: string;
  archived: boolean;
};

export const STAGES = [
  { id: "ny", label: "Ny", chip: "bg-foam text-ink" },
  { id: "kontaktad", label: "Kontaktad", chip: "bg-sea text-white" },
  { id: "intresserad", label: "Intresserad", chip: "bg-amber text-ink" },
  { id: "offert", label: "Offert", chip: "bg-amber-soft text-ink ring-1 ring-amber" },
  { id: "kund", label: "Kund", chip: "bg-green text-white" },
  { id: "ej-intresserad", label: "Ej intresserad", chip: "bg-rust/10 text-rust" },
] as const;

export type StageId = (typeof STAGES)[number]["id"];

export function stageInfo(id: string) {
  return STAGES.find((item) => item.id === id) ?? STAGES[0];
}

export type StageChange = { at: string; by: string; from: StageId; to: StageId };

export const FLAGS = [
  {
    id: "nix",
    label: "Reklamspärr (NIX)",
    detail: "Bolaget har spärrat sig mot telefonförsäljning. Ring inte och skicka inga SMS.",
    blocks: ["phone", "sms"],
  },
  {
    id: "ingen-telefon",
    label: "Ingen telefonmarknadsföring",
    detail: "Bolaget har sagt att de inte vill bli uppringda i försäljningssyfte. Ring inte.",
    blocks: ["phone"],
  },
  {
    id: "avregistrerad",
    label: "Avregistrerad",
    detail: "Bolaget har bett att slippa all kontakt. Kontakta inte via någon kanal.",
    blocks: ["phone", "sms", "mail"],
  },
] as const;

export type FlagId = (typeof FLAGS)[number]["id"];
export type Channel = "phone" | "sms" | "mail";

export type FlagEntry = { id: FlagId; at: string; by: string; note: string };

export type CompanyMeta = {
  orgNr: string;
  stage: StageId;
  stageHistory: StageChange[];
  tags: string[];
  flags: FlagEntry[];
};

export type Task = {
  id: string;
  orgNr: string;
  companyName: string;
  contactId: string;
  contactName: string;
  dueAt: string;
  note: string;
  kind: "ring" | "mejla" | "mote" | "annat";
  assignee: StaffId;
  assigneeName: string;
  createdBy: string;
  createdAt: string;
  remindMin: number;
  doneAt: string;
  doneBy: string;
};

export const TASK_KINDS = [
  { id: "ring", label: "Ring" },
  { id: "mejla", label: "Mejla" },
  { id: "mote", label: "Möte" },
  { id: "annat", label: "Annat" },
] as const;

export type SavedView = {
  id: string;
  name: string;
  scope: "kunder" | "sok";
  userId: StaffId;
  owner: string;
  stage: string;
  tag: string;
  text: string;
  phoneOnly: boolean;
  selection: string;
  archived: boolean;
  createdAt: string;
};

export type Template = {
  id: string;
  kind: "mejl" | "sms";
  name: string;
  subject: string;
  body: string;
  createdBy: string;
  createdAt: string;
  archived: boolean;
};

export type Draft = {
  id: string;
  orgNr: string;
  contactId: string;
  kind: "mejl" | "sms";
  to: string;
  subject: string;
  body: string;
  createdBy: string;
  createdAt: string;
};


export const OPP_STAGES = [
  { id: "ny", label: "Ny", head: "bg-foam text-ink", closed: "" },
  { id: "kontaktad", label: "Kontaktad", head: "bg-sea text-white", closed: "" },
  { id: "behov", label: "Behov klarlagt", head: "bg-sea-deep text-white", closed: "" },
  { id: "offert", label: "Offert skickad", head: "bg-amber text-ink", closed: "" },
  { id: "forhandling", label: "Förhandling", head: "bg-amber-soft text-ink ring-1 ring-amber", closed: "" },
  { id: "muntligt", label: "Muntligt ja", head: "bg-green-soft text-green ring-1 ring-green", closed: "" },
  { id: "signerad", label: "Signerad (vunnen)", head: "bg-green text-white", closed: "won" },
  { id: "forlorad", label: "Förlorad", head: "bg-rust text-white", closed: "lost" },
] as const;

export type OppStageId = (typeof OPP_STAGES)[number]["id"];

export function oppStageInfo(id: string) {
  return OPP_STAGES.find((item) => item.id === id) ?? OPP_STAGES[0];
}

export function isOppClosed(stage: string): boolean {
  return stage === "signerad" || stage === "forlorad";
}

export type Temperature = "varm" | "ljummen" | "kall";

export const TEMPERATURES: { id: Temperature; label: string; chip: string }[] = [
  { id: "varm", label: "Varm", chip: "bg-rust text-white" },
  { id: "ljummen", label: "Ljummen", chip: "bg-amber text-ink" },
  { id: "kall", label: "Kall", chip: "bg-foam text-sea" },
];

export const OPP_SOURCES = ["Kallringning", "Inkommande", "Referens", "Mejl", "Sociala medier", "Event", "Annat"];
export const LOSS_REASONS = ["Pris", "Valde konkurrent", "Inget behov nu", "Ingen budget", "Ingen respons", "Fel tidpunkt", "Annat"];

export type OppStageChange = { at: string; by: string; from: OppStageId; to: OppStageId; note: string };

export type Opportunity = {
  id: string;
  orgNr: string;
  companyName: string;
  contactId: string;
  contactName: string;
  title: string;
  ownerId: StaffId;
  ownerName: string;
  value: number;
  expectedClose: string;
  temperature: Temperature;
  source: string;
  nextStep: string;
  nextStepAt: string;
  stage: OppStageId;
  stageEnteredAt: string;
  stageHistory: OppStageChange[];
  lossReason: string;
  closedAt: string;
  closedBy: string;
  createdAt: string;
  createdBy: string;
  lastTouchAt: string;
};

export type NewOpportunity = {
  orgNr: string;
  contactId?: string;
  title: string;
  value: number;
  expectedClose: string;
  temperature: Temperature;
  source: string;
  nextStep: string;
  nextStepAt: string;
  ownerId?: StaffId;
  stage?: OppStageId;
};

export type OppFlags = { overdue: boolean; stale: boolean; noFollowUp: boolean };

export function oppFlags(opp: Opportunity, now: number, staleDays: number): OppFlags {
  if (isOppClosed(opp.stage)) return { overdue: false, stale: false, noFollowUp: false };
  const dayMs = 86_400_000;
  const due = opp.nextStepAt ? new Date(opp.nextStepAt).getTime() : NaN;
  const touched = Math.max(new Date(opp.lastTouchAt || opp.stageEnteredAt).getTime(), new Date(opp.stageEnteredAt).getTime());
  return {
    overdue: !Number.isNaN(due) && due < now,
    stale: now - touched > staleDays * dayMs,
    noFollowUp: Number.isNaN(due) || due - now > staleDays * dayMs,
  };
}

export function formatMoney(value: number): string {
  return `${new Intl.NumberFormat("sv-SE").format(Math.round(value))} kr`;
}

export type AuditEntry = {
  id: string;
  at: string;
  userId: StaffId;
  userName: string;
  role: Role;
  action: string;
  orgNr: string;
  target: string;
  before: string;
  after: string;
};

const SEGMENTS_KEY = "visalight-crm-segments";
const ACTIVITY_KEY = "visalight-crm-activity";
const LEGACY_LOG_KEY = "visalight-crm-log";
const CLAIMS_KEY = "visalight-crm-claims";
const MINE_KEY = "visalight-crm-mine";
const USER_KEY = "visalight-crm-user";
const CONTACTS_KEY = "visalight-crm-contacts";
const STRUCK_KEY = "visalight-crm-struck-phones";
const CALLLISTS_KEY = "visalight-crm-calllists";
const META_KEY = "visalight-crm-meta";
const TASKS_KEY = "visalight-crm-tasks";
const VIEWS_KEY = "visalight-crm-views";
const TEMPLATES_KEY = "visalight-crm-templates";
const DRAFTS_KEY = "visalight-crm-drafts";
const AUDIT_KEY = "visalight-crm-audit";
const OPPS_KEY = "visalight-crm-opps";
const SETTINGS_KEY = "visalight-crm-settings";

const SAMPLE_PURCHASES: Purchase[] = [
  {
    id: "VL-1842",
    orgNr: "559100-1001",
    at: "2026-10-02T09:15:00.000Z",
    what: "Restauranger i Stockholm, med telefon",
    sum: "535 kr",
  },
  {
    id: "VL-0901",
    orgNr: "559100-1019",
    at: "2026-09-18T13:40:00.000Z",
    what: "Frisörer i Stockholm",
    sum: "399 kr",
  },
];

/** Exempel på spärrar som i verkligheten kommer från registret och spärrlistorna. */
const SEED_FLAGS: { orgNr: string; flag: FlagId }[] = [
  { orgNr: "559100-1009", flag: "nix" },
  { orgNr: "559100-1017", flag: "ingen-telefon" },
];

const SEED_TEMPLATES: Omit<Template, "createdAt" | "createdBy" | "archived">[] = [
  {
    id: "mall-mejl-forsta",
    kind: "mejl",
    name: "Första kontakt",
    subject: "Färsk företagsdata för {{foretag}}",
    body: "Hej {{fornamn}},\n\nVi på VisaLight levererar verifierad och färsk företagsdata till företag som vill nå rätt kunder. Jag tittade på {{foretag}} och tror att ett utdrag i er bransch kan spara tid.\n\nPassar det med ett kort samtal i veckan?\n\nVänliga hälsningar\n{{saljare}}\nVisaLight",
  },
  {
    id: "mall-mejl-uppfoljning",
    kind: "mejl",
    name: "Uppföljning efter samtal",
    subject: "Tack för samtalet, {{fornamn}}",
    body: "Hej {{fornamn}},\n\nTack för att du tog dig tid att prata med mig. Som lovat skickar jag mer information om utdraget för {{foretag}}.\n\nHör av dig om du har frågor.\n\nVänliga hälsningar\n{{saljare}}\nVisaLight",
  },
  {
    id: "mall-sms-missat",
    kind: "sms",
    name: "Missat samtal",
    subject: "",
    body: "Hej {{fornamn}}, det är {{saljare}} från VisaLight. Jag försökte nå er på {{foretag}} angående färsk företagsdata. Ring gärna tillbaka eller svara på det här SMS:et.",
  },
];

type LegacyLog = {
  id?: string;
  orgNr?: string;
  companyName?: string;
  at?: string;
  channel?: string;
  note?: string;
};

export function outcomeLabel(id: string): string {
  const outcome = OUTCOMES.find((item) => item.id === id);
  if (outcome) return outcome.label;
  return (SYSTEM_EVENTS as Record<string, string>)[id] ?? id;
}

export function outcomeInfo(id: string) {
  return OUTCOMES.find((item) => item.id === id) ?? null;
}

export function formatStamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Stockholm",
  }).format(date);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function localInput(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function tomorrowMorningLocal(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return localInput(date);
}

export function laterTodayLocal(hours = 2): string {
  const date = new Date(Date.now() + hours * 3600_000);
  date.setMinutes(Math.ceil(date.getMinutes() / 5) * 5, 0, 0);
  return localInput(date);
}

export function nextWeekLocal(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(9, 0, 0, 0);
  return localInput(date);
}

/** datetime-local ger lokal tid utan zon. Spara den som ISO så att formatStamp och jämförelser stämmer. */
export function localInputToIso(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

export function isSameDay(iso: string, now = new Date()): boolean {
  const date = new Date(iso);
  return (
    date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
  );
}

function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function readList<T>(key: string): T[] {
  try {
    const raw = readStored(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  } catch {
    /* Lagring kan vara blockerad. Läget finns kvar tills sidan laddas om. */
  }
}

function sameOrg(a: string, b: string): boolean {
  return a.replace(/\D/g, "") === b.replace(/\D/g, "");
}

export function readPurchases(orgNr: string): Purchase[] {
  let live: OrderDraft[] = [];
  try {
    const raw = sessionStorage.getItem(ORDER_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as OrderDraft[]) : [];
    live = Array.isArray(parsed) ? parsed : [];
  } catch {
    live = [];
  }
  const fromOrder = live.flatMap((order) => {
    if (!order || typeof order.orgNr !== "string" || !sameOrg(order.orgNr, orgNr)) return [];
    return [
      {
        id: order.id,
        orgNr,
        at: order.createdAt,
        what: "Förhandsbokning",
        sum: "Ingen betalning",
      },
    ];
  });
  const samples = SAMPLE_PURCHASES.filter((item) => sameOrg(item.orgNr, orgNr));
  return [...fromOrder, ...samples].sort((a, b) => b.at.localeCompare(a.at));
}

function normalizeSegment(raw: Partial<Segment>): Segment | null {
  if (!raw.id || !raw.name) return null;
  return {
    id: raw.id,
    name: raw.name,
    query: raw.query ?? "",
    city: raw.city ?? "",
    county: raw.county ?? "",
    bransch: raw.bransch ?? "",
    sni: raw.sni ?? "",
    forms: Array.isArray(raw.forms) ? raw.forms : [],
    employees: raw.employees ?? "",
    orgNrs: Array.isArray(raw.orgNrs) ? raw.orgNrs : undefined,
    createdBy: raw.createdBy ?? "",
    createdAt: raw.createdAt ?? "",
    archived: Boolean(raw.archived),
  };
}

function normalizeContact(raw: Partial<Contact> & { emails?: { id: string; value: string; struck?: boolean }[] }): Contact | null {
  if (!raw.id || !raw.orgNr) return null;
  return {
    id: raw.id,
    orgNr: raw.orgNr,
    firstName: raw.firstName ?? "",
    lastName: raw.lastName ?? "",
    role: raw.role ?? "",
    phones: Array.isArray(raw.phones) ? raw.phones : [],
    emails: Array.isArray(raw.emails) ? raw.emails.map((item) => ({ ...item, struck: Boolean(item.struck) })) : [],
    struck: Boolean(raw.struck),
    struckAt: raw.struckAt ?? "",
    struckBy: raw.struckBy ?? "",
    createdAt: raw.createdAt ?? "",
    createdBy: raw.createdBy ?? "",
  };
}

function readClaims(): Claim[] {
  if (readStored(CLAIMS_KEY)) {
    return readList<Claim>(CLAIMS_KEY).flatMap((item) => {
      if (!item || typeof item.orgNr !== "string" || typeof item.at !== "string") return [];
      const person = STAFF.find((staff) => staff.id === item.userId);
      if (!person) return [];
      return [{ orgNr: item.orgNr, userId: person.id, userName: person.name, at: item.at }];
    });
  }
  return readList<string>(MINE_KEY).flatMap((orgNr) => {
    if (typeof orgNr !== "string") return [];
    return [{ orgNr, userId: STAFF[0].id, userName: STAFF[0].name, at: new Date().toISOString() }];
  });
}

function readActivities(): Activity[] {
  const current = readList<Activity>(ACTIVITY_KEY).filter((item) => item && typeof item.orgNr === "string" && item.outcome);
  if (readStored(ACTIVITY_KEY)) return current;
  return readList<LegacyLog>(LEGACY_LOG_KEY).flatMap((item) => {
    if (!item.orgNr || !item.at) return [];
    const outcome: OutcomeId = item.channel === "mejl" ? "mailat" : "svar";
    return [
      {
        id: item.id || crypto.randomUUID(),
        orgNr: item.orgNr,
        companyName: item.companyName || item.orgNr,
        at: item.at,
        userId: STAFF[0].id,
        userName: STAFF[0].name,
        outcome,
        note: item.note || "",
        nextAt: "",
        nextNote: "",
        struckPhone: "",
      },
    ];
  });
}

function readUserId(): StaffId {
  const stored = readStored(USER_KEY);
  return STAFF.find((staff) => staff.id === stored)?.id ?? STAFF[0].id;
}

function readMetas(): CompanyMeta[] {
  if (readStored(META_KEY)) {
    return readList<Partial<CompanyMeta>>(META_KEY).flatMap((item) =>
      item && item.orgNr
        ? [
            {
              orgNr: item.orgNr,
              stage: (item.stage as StageId) ?? "ny",
              stageHistory: item.stageHistory ?? [],
              tags: item.tags ?? [],
              flags: item.flags ?? [],
            },
          ]
        : [],
    );
  }
  const at = new Date().toISOString();
  return SEED_FLAGS.map((seed) => ({
    orgNr: seed.orgNr,
    stage: "ny" as StageId,
    stageHistory: [],
    tags: [],
    flags: [{ id: seed.flag, at, by: "Registret", note: "Exempeldata" }],
  }));
}

function readTasks(activities: Activity[]): Task[] {
  if (readStored(TASKS_KEY)) return readList<Task>(TASKS_KEY).filter((item) => item && item.id && item.orgNr);
  const real = activities.filter((item) => !isSystemKind(item.outcome));
  return activities.flatMap((item) => {
    if (!item.nextAt) return [];
    const superseded = real.some((other) => other.orgNr === item.orgNr && other.at > item.at);
    if (superseded) return [];
    const person = STAFF.find((staff) => staff.id === item.userId) ?? STAFF[0];
    return [
      {
        id: crypto.randomUUID(),
        orgNr: item.orgNr,
        companyName: item.companyName,
        contactId: item.contactId ?? "",
        contactName: item.contactName ?? "",
        dueAt: item.nextAt,
        note: item.nextNote,
        kind: "ring" as const,
        assignee: person.id,
        assigneeName: person.name,
        createdBy: item.userName,
        createdAt: item.at,
        remindMin: 0,
        doneAt: "",
        doneBy: "",
      },
    ];
  });
}

function readTemplates(): Template[] {
  if (readStored(TEMPLATES_KEY)) return readList<Template>(TEMPLATES_KEY).filter((item) => item && item.id);
  const at = new Date().toISOString();
  return SEED_TEMPLATES.map((item) => ({ ...item, createdBy: "VisaLight", createdAt: at, archived: false }));
}

function useSaved<T>(key: string, value: T, ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    writeStored(key, value);
  }, [key, value, ready]);
}

export type NewCallList = {
  name: string;
  source: string;
  orgNrs: string[];
};

export function normalizeName(value: string): string {
  return value
    .toLocaleLowerCase("sv")
    .replace(/\b(aktiebolag|ab|hb|kb|ekonomisk förening|brf)\b/g, "")
    .replace(/[^a-zåäö0-9]/g, "");
}

export function digitsOf(value: string): string {
  return value.replace(/\D/g, "");
}

export function selectionFromSegment(segment: Segment): Selection {
  return {
    ...defaultSelection,
    phones: false,
    emails: false,
    signatory: false,
    query: segment.query,
    city: segment.city,
    county: segment.county,
    bransch: segment.bransch,
    sni: segment.sni,
    forms: segment.forms,
    employees: segment.employees,
  };
}

export function segmentCompanies(segment: Segment): Company[] {
  if (segment.orgNrs) return COMPANIES.filter((item) => segment.orgNrs?.includes(item.orgNr));
  return filterCompanies(selectionFromSegment(segment));
}

function useCrmState() {
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<StaffId>(STAFF[0].id);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [struckPhones, setStruckPhones] = useState<{ orgNr: string; value: string }[]>([]);
  const [callLists, setCallLists] = useState<CallList[]>([]);
  const [metas, setMetas] = useState<CompanyMeta[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [views, setViews] = useState<SavedView[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [staleDays, setStaleDaysState] = useState(10);
  const [now, setNow] = useState(() => Date.now());
  const claimsRef = useRef<Claim[]>([]);

  useEffect(() => {
    setUserId(readUserId());
    setClaims(readClaims());
    setSegments(
      readList<Partial<Segment>>(SEGMENTS_KEY).flatMap((item) => {
        const segment = normalizeSegment(item);
        return segment ? [segment] : [];
      }),
    );
    setContacts(
      readList<Partial<Contact>>(CONTACTS_KEY).flatMap((item) => {
        const contact = normalizeContact(item);
        return contact ? [contact] : [];
      }),
    );
    const loadedActivities = readActivities();
    setActivities(loadedActivities);
    setStruckPhones(readList<{ orgNr: string; value: string }>(STRUCK_KEY));
    setCallLists(
      readList<CallList>(CALLLISTS_KEY).filter(
        (item) => item && item.id && Array.isArray(item.orgNrs) && item.results && typeof item.results === "object",
      ),
    );
    setMetas(readMetas());
    setTasks(readTasks(loadedActivities));
    setViews(readList<SavedView>(VIEWS_KEY).filter((item) => item && item.id));
    setTemplates(readTemplates());
    setDrafts(readList<Draft>(DRAFTS_KEY).filter((item) => item && item.id));
    setAudit(readList<AuditEntry>(AUDIT_KEY).filter((item) => item && item.id));
    setOpps(readList<Opportunity>(OPPS_KEY).filter((item) => item && item.id && item.orgNr));
    const storedDays = Number(readStored(SETTINGS_KEY));
    if (storedDays >= 1 && storedDays <= 60) setStaleDaysState(storedDays);
    setReady(true);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    claimsRef.current = claims;
  }, [claims]);

  useSaved(USER_KEY, userId, ready);
  useSaved(CLAIMS_KEY, claims, ready);
  useSaved(SEGMENTS_KEY, segments, ready);
  useSaved(CONTACTS_KEY, contacts, ready);
  useSaved(ACTIVITY_KEY, activities, ready);
  useSaved(STRUCK_KEY, struckPhones, ready);
  useSaved(CALLLISTS_KEY, callLists, ready);
  useSaved(META_KEY, metas, ready);
  useSaved(TASKS_KEY, tasks, ready);
  useSaved(VIEWS_KEY, views, ready);
  useSaved(TEMPLATES_KEY, templates, ready);
  useSaved(DRAFTS_KEY, drafts, ready);
  useSaved(AUDIT_KEY, audit, ready);
  useSaved(OPPS_KEY, opps, ready);

  const currentUser = STAFF.find((person) => person.id === userId) ?? STAFF[0];
  const isAdmin = currentUser.role === "admin";

  function companyName(orgNr: string) {
    return COMPANIES.find((item) => item.orgNr === orgNr)?.name ?? orgNr;
  }

  function writeAudit(action: string, orgNr: string, target: string, before = "", after = "") {
    setAudit((current) => [
      {
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.name,
        role: currentUser.role,
        action,
        orgNr,
        target,
        before,
        after,
      },
      ...current,
    ]);
  }

  function logEvent(orgNr: string, kind: ActivityKind, extra: Partial<Activity> = {}) {
    setActivities((current) => [
      {
        id: crypto.randomUUID(),
        orgNr,
        companyName: companyName(orgNr),
        at: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.name,
        outcome: kind,
        note: "",
        nextAt: "",
        nextNote: "",
        struckPhone: "",
        ...extra,
      },
      ...current,
    ]);
  }

  function metaOf(orgNr: string): CompanyMeta {
    return metas.find((item) => item.orgNr === orgNr) ?? { orgNr, stage: "ny", stageHistory: [], tags: [], flags: [] };
  }

  function patchMeta(orgNr: string, change: (meta: CompanyMeta) => CompanyMeta) {
    setMetas((current) => {
      const existing = current.find((item) => item.orgNr === orgNr) ?? {
        orgNr,
        stage: "ny" as StageId,
        stageHistory: [],
        tags: [],
        flags: [],
      };
      const next = change(existing);
      return current.some((item) => item.orgNr === orgNr)
        ? current.map((item) => (item.orgNr === orgNr ? next : item))
        : [next, ...current];
    });
  }

  function setStage(orgNr: string, stage: StageId, note = "") {
    const current = metaOf(orgNr).stage;
    if (current === stage) return;
    patchMeta(orgNr, (meta) => ({
      ...meta,
      stage,
      stageHistory: [{ at: new Date().toISOString(), by: currentUser.name, from: meta.stage, to: stage }, ...meta.stageHistory],
    }));
    logEvent(orgNr, "status", { note: `${stageInfo(current).label} → ${stageInfo(stage).label}${note ? ` · ${note}` : ""}` });
    writeAudit("Ändrade status", orgNr, companyName(orgNr), stageInfo(current).label, stageInfo(stage).label);
  }

  function addTag(orgNr: string, tag: string) {
    const clean = tag.trim().toLowerCase().replace(/\s+/g, "-");
    if (!clean) return;
    if (metaOf(orgNr).tags.includes(clean)) return;
    patchMeta(orgNr, (meta) => ({ ...meta, tags: [...meta.tags, clean] }));
    logEvent(orgNr, "tagg", { note: `Lade till taggen ${clean}` });
  }

  function removeTag(orgNr: string, tag: string) {
    patchMeta(orgNr, (meta) => ({ ...meta, tags: meta.tags.filter((item) => item !== tag) }));
    logEvent(orgNr, "tagg", { note: `Tog bort taggen ${tag}` });
  }

  function addFlag(orgNr: string, flag: FlagId, note = "") {
    if (metaOf(orgNr).flags.some((item) => item.id === flag)) return;
    patchMeta(orgNr, (meta) => ({
      ...meta,
      flags: [...meta.flags, { id: flag, at: new Date().toISOString(), by: currentUser.name, note }],
    }));
    const label = FLAGS.find((item) => item.id === flag)?.label ?? flag;
    logEvent(orgNr, "sparr-satt", { note: `${label}${note ? ` · ${note}` : ""}` });
    writeAudit("Satte spärr", orgNr, companyName(orgNr), "", label);
  }

  function removeFlag(orgNr: string, flag: FlagId) {
    if (!isAdmin) return;
    patchMeta(orgNr, (meta) => ({ ...meta, flags: meta.flags.filter((item) => item.id !== flag) }));
    const label = FLAGS.find((item) => item.id === flag)?.label ?? flag;
    logEvent(orgNr, "sparr-borttagen", { note: label });
    writeAudit("Tog bort spärr", orgNr, companyName(orgNr), label, "");
  }

  function blockedChannels(orgNr: string): Channel[] {
    const out = new Set<Channel>();
    for (const entry of metaOf(orgNr).flags) {
      FLAGS.find((item) => item.id === entry.id)?.blocks.forEach((channel) => out.add(channel));
    }
    return [...out];
  }

  function toggleStar(orgNr: string) {
    const existing = claimsRef.current.find((item) => item.orgNr === orgNr);
    if (existing && existing.userId !== userId && !isAdmin) return;
    if (existing) {
      setClaims((current) => current.filter((item) => item.orgNr !== orgNr));
      logEvent(orgNr, "agare-slappt", existing.userId !== userId ? { note: `Släppte ${existing.userName}s bolag` } : {});
      writeAudit("Släppte ägarskap", orgNr, companyName(orgNr), existing.userName, "");
      return;
    }
    setClaims((current) => [
      { orgNr, userId: currentUser.id, userName: currentUser.name, at: new Date().toISOString() },
      ...current,
    ]);
    logEvent(orgNr, "agare-satt");
    writeAudit("Tog ägarskap", orgNr, companyName(orgNr), "", currentUser.name);
  }

  function assignOwner(orgNrs: string[], target: StaffId) {
    if (!isAdmin) return;
    const person = STAFF.find((item) => item.id === target);
    if (!person) return;
    setClaims((current) => [
      ...orgNrs.map((orgNr) => ({ orgNr, userId: person.id, userName: person.name, at: new Date().toISOString() })),
      ...current.filter((item) => !orgNrs.includes(item.orgNr)),
    ]);
    for (const orgNr of orgNrs) {
      logEvent(orgNr, "agare-satt", { note: `Tilldelad ${person.name} av ${currentUser.name}` });
      writeAudit("Tilldelade bolag", orgNr, companyName(orgNr), "", person.name);
    }
  }

  function claimMany(orgNrs: string[]): number {
    const free = orgNrs.filter((orgNr) => !claimsRef.current.some((item) => item.orgNr === orgNr));
    if (free.length === 0) return 0;
    setClaims((current) => [
      ...free.map((orgNr) => ({ orgNr, userId: currentUser.id, userName: currentUser.name, at: new Date().toISOString() })),
      ...current,
    ]);
    for (const orgNr of free) {
      logEvent(orgNr, "agare-satt");
      writeAudit("Tog ägarskap", orgNr, companyName(orgNr), "", currentUser.name);
    }
    return free.length;
  }

  function tagMany(orgNrs: string[], tag: string) {
    for (const orgNr of orgNrs) addTag(orgNr, tag);
  }

  function addContact(contact: Omit<Contact, "createdAt" | "createdBy" | "struckAt" | "struckBy">) {
    setContacts((current) => [
      { ...contact, struckAt: "", struckBy: "", createdAt: new Date().toISOString(), createdBy: currentUser.name },
      ...current,
    ]);
    logEvent(contact.orgNr, "kontakt-ny", {
      note: `${contact.firstName} ${contact.lastName}${contact.role ? ` (${contact.role})` : ""}`,
      contactId: contact.id,
      contactName: `${contact.firstName} ${contact.lastName}`,
    });
  }

  function patchContact(id: string, change: (item: Contact) => Contact) {
    setContacts((current) => current.map((item) => (item.id === id ? change(item) : item)));
  }

  function strikeContact(id: string) {
    const person = contacts.find((item) => item.id === id);
    patchContact(id, (item) => ({
      ...item,
      struck: true,
      struckAt: new Date().toISOString(),
      struckBy: currentUser.name,
    }));
    if (person) {
      const name = `${person.firstName} ${person.lastName}`;
      logEvent(person.orgNr, "kontakt-struken", { note: name, contactId: id, contactName: name });
      writeAudit("Strök kontaktperson", person.orgNr, name, "Aktiv", "Struken");
    }
  }

  function reactivateContact(id: string) {
    if (!isAdmin) return;
    const person = contacts.find((item) => item.id === id);
    patchContact(id, (item) => ({ ...item, struck: false, struckAt: "", struckBy: "" }));
    if (person) {
      const name = `${person.firstName} ${person.lastName}`;
      logEvent(person.orgNr, "kontakt-aterstalld", { note: name, contactId: id, contactName: name });
      writeAudit("Återställde kontaktperson", person.orgNr, name, "Struken", "Aktiv");
    }
  }

  function addContactPhone(contactId: string, value: string) {
    patchContact(contactId, (item) => ({
      ...item,
      phones: [...item.phones, { id: crypto.randomUUID(), value, struck: false }],
    }));
  }

  function addContactEmail(contactId: string, value: string) {
    patchContact(contactId, (item) => ({
      ...item,
      emails: [...item.emails, { id: crypto.randomUUID(), value, struck: false }],
    }));
  }

  function setContactPhoneStruck(contactId: string, phoneId: string, struck: boolean) {
    if (!struck && !isAdmin) return;
    const person = contacts.find((item) => item.id === contactId);
    const value = person?.phones.find((phone) => phone.id === phoneId)?.value ?? "";
    patchContact(contactId, (item) => ({
      ...item,
      phones: item.phones.map((phone) => (phone.id === phoneId ? { ...phone, struck } : phone)),
    }));
    if (person) {
      writeAudit(struck ? "Strök nummer" : "Återställde nummer", person.orgNr, value, struck ? "Aktivt" : "Struket", struck ? "Struket" : "Aktivt");
    }
  }

  function setContactEmailStruck(contactId: string, emailId: string, struck: boolean) {
    if (!struck && !isAdmin) return;
    const person = contacts.find((item) => item.id === contactId);
    const value = person?.emails.find((mail) => mail.id === emailId)?.value ?? "";
    patchContact(contactId, (item) => ({
      ...item,
      emails: item.emails.map((mail) => (mail.id === emailId ? { ...mail, struck } : mail)),
    }));
    if (person) {
      writeAudit(struck ? "Strök e-post" : "Återställde e-post", person.orgNr, value, struck ? "Aktiv" : "Struken", struck ? "Struken" : "Aktiv");
    }
  }

  function strikePhone(orgNr: string, value: string, contactId?: string, phoneId?: string) {
    if (contactId && phoneId) setContactPhoneStruck(contactId, phoneId, true);
    setStruckPhones((current) =>
      current.some((item) => item.orgNr === orgNr && item.value === value) ? current : [...current, { orgNr, value }],
    );
    writeAudit("Strök nummer", orgNr, value, "Aktivt", "Struket");
  }

  function restorePhone(orgNr: string, value: string) {
    if (!isAdmin) return;
    setStruckPhones((current) => current.filter((item) => !(item.orgNr === orgNr && item.value === value)));
    writeAudit("Återställde nummer", orgNr, value, "Struket", "Aktivt");
  }

  function addTask(input: {
    orgNr: string;
    contactId?: string;
    dueAt: string;
    note: string;
    kind: Task["kind"];
    assignee?: StaffId;
    remindMin?: number;
  }) {
    if (!input.dueAt) return;
    const contact = contacts.find((item) => item.id === input.contactId);
    const assignee = STAFF.find((item) => item.id === input.assignee) ?? currentUser;
    setTasks((current) => [
      {
        id: crypto.randomUUID(),
        orgNr: input.orgNr,
        companyName: companyName(input.orgNr),
        contactId: contact?.id ?? "",
        contactName: contact ? `${contact.firstName} ${contact.lastName}` : "",
        dueAt: input.dueAt,
        note: input.note,
        kind: input.kind,
        assignee: assignee.id,
        assigneeName: assignee.name,
        createdBy: currentUser.name,
        createdAt: new Date().toISOString(),
        remindMin: input.remindMin ?? 0,
        doneAt: "",
        doneBy: "",
      },
      ...current,
    ]);
    logEvent(input.orgNr, "uppgift-ny", {
      note: `${TASK_KINDS.find((item) => item.id === input.kind)?.label ?? ""} ${formatStamp(input.dueAt)}${input.note ? ` · ${input.note}` : ""} (${assignee.name})`,
    });
  }

  function completeTask(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task || task.doneAt) return;
    setTasks((current) =>
      current.map((item) => (item.id === id ? { ...item, doneAt: new Date().toISOString(), doneBy: currentUser.name } : item)),
    );
    logEvent(task.orgNr, "uppgift-klar", { note: task.note || "Uppföljning" });
  }

  function reopenTask(id: string) {
    setTasks((current) => current.map((item) => (item.id === id ? { ...item, doneAt: "", doneBy: "" } : item)));
  }

  function stageAfter(outcome: ActivityKind, stage: StageId): StageId | null {
    if (stage === "kund") return null;
    const order: StageId[] = ["ny", "kontaktad", "intresserad", "offert", "kund"];
    const at = (id: StageId) => order.indexOf(id);
    switch (outcome) {
      case "ej-svar":
      case "upptaget":
      case "svar":
      case "ring-igen":
      case "fel-person":
      case "mailat":
      case "sms":
      case "social":
        return stage === "ny" ? "kontaktad" : null;
      case "intresserad":
      case "mote":
        return at(stage) >= 0 && at(stage) < at("intresserad") ? "intresserad" : null;
      case "offert":
        return at(stage) >= 0 && at(stage) < at("offert") ? "offert" : null;
      case "ej-intresserad":
      case "sparr":
        return "ej-intresserad";
      default:
        return null;
    }
  }

  function addActivity(entry: Activity) {
    setActivities((current) => [entry, ...current]);
    const info = outcomeInfo(entry.outcome);
    if (info && info.call) {
      const cutoff = Date.now() + 12 * 3600_000;
      setTasks((current) =>
        current.map((item) =>
          item.orgNr === entry.orgNr && item.assignee === entry.userId && !item.doneAt && new Date(item.dueAt).getTime() <= cutoff
            ? { ...item, doneAt: new Date().toISOString(), doneBy: entry.userName }
            : item,
        ),
      );
    }
    if (entry.nextAt && entry.outcome !== "anteckning") {
      const assignee = STAFF.find((item) => item.id === entry.userId) ?? currentUser;
      setTasks((current) => [
        {
          id: crypto.randomUUID(),
          orgNr: entry.orgNr,
          companyName: entry.companyName,
          contactId: entry.contactId ?? "",
          contactName: entry.contactName ?? "",
          dueAt: entry.nextAt,
          note: entry.nextNote,
          kind: "ring",
          assignee: assignee.id,
          assigneeName: assignee.name,
          createdBy: entry.userName,
          createdAt: entry.at,
          remindMin: 0,
          doneAt: "",
          doneBy: "",
        },
        ...current,
      ]);
    }
    if (!isSystemKind(entry.outcome)) {
      setOpps((current) =>
        current.map((item) => (item.orgNr === entry.orgNr && !isOppClosed(item.stage) ? { ...item, lastTouchAt: entry.at } : item)),
      );
    }
    const stage = metaOf(entry.orgNr).stage;
    const to = stageAfter(entry.outcome, stage);
    if (to && to !== stage) setStage(entry.orgNr, to, "automatiskt efter utfall");
  }


  function addOpportunity(input: NewOpportunity): string | null {
    if (!input.nextStep.trim() || !input.nextStepAt || !input.title.trim()) return null;
    const contact = contacts.find((item) => item.id === input.contactId);
    const owner = STAFF.find((item) => item.id === input.ownerId) ?? currentUser;
    const at = new Date().toISOString();
    const stage = input.stage && !isOppClosed(input.stage) ? input.stage : "ny";
    const id = crypto.randomUUID();
    setOpps((current) => [
      {
        id,
        orgNr: input.orgNr,
        companyName: companyName(input.orgNr),
        contactId: contact?.id ?? "",
        contactName: contact ? `${contact.firstName} ${contact.lastName}` : "",
        title: input.title.trim(),
        ownerId: owner.id,
        ownerName: owner.name,
        value: input.value,
        expectedClose: input.expectedClose,
        temperature: input.temperature,
        source: input.source,
        nextStep: input.nextStep.trim(),
        nextStepAt: input.nextStepAt,
        stage,
        stageEnteredAt: at,
        stageHistory: [{ at, by: currentUser.name, from: stage, to: stage, note: "Skapad" }],
        lossReason: "",
        closedAt: "",
        closedBy: "",
        createdAt: at,
        createdBy: currentUser.name,
        lastTouchAt: at,
      },
      ...current,
    ]);
    logEvent(input.orgNr, "mojlighet-ny", {
      note: `${input.title.trim()} · ${formatMoney(input.value)} · ${input.temperature} · ägare ${owner.name}`,
      contactId: contact?.id ?? "",
      contactName: contact ? `${contact.firstName} ${contact.lastName}` : "",
    });
    const stageNow = metaOf(input.orgNr).stage;
    if (stageNow === "ny" || stageNow === "kontaktad") setStage(input.orgNr, "intresserad", "möjlighet skapad");
    return id;
  }

  function moveOpportunity(id: string, to: OppStageId, extra: { lossReason?: string; note?: string } = {}): boolean {
    const opp = opps.find((item) => item.id === id);
    if (!opp || opp.stage === to) return false;
    if (isOppClosed(opp.stage) && !isAdmin) return false;
    if (to === "forlorad" && !extra.lossReason?.trim()) return false;
    const at = new Date().toISOString();
    const closing = isOppClosed(to);
    setOpps((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              stage: to,
              stageEnteredAt: at,
              lastTouchAt: at,
              stageHistory: [{ at, by: currentUser.name, from: item.stage, to, note: extra.note ?? "" }, ...item.stageHistory],
              lossReason: to === "forlorad" ? extra.lossReason ?? "" : "",
              closedAt: closing ? at : "",
              closedBy: closing ? currentUser.name : "",
            }
          : item,
      ),
    );
    logEvent(opp.orgNr, "mojlighet-fas", {
      note: `${opp.title}: ${oppStageInfo(opp.stage).label} → ${oppStageInfo(to).label}${to === "forlorad" ? ` · orsak: ${extra.lossReason}` : ""}${extra.note ? ` · ${extra.note}` : ""}`,
    });
    if (closing || isOppClosed(opp.stage)) {
      writeAudit(closing ? (to === "signerad" ? "Vann möjlighet" : "Förlorade möjlighet") : "Öppnade stängd möjlighet", opp.orgNr, opp.title, oppStageInfo(opp.stage).label, oppStageInfo(to).label);
    }
    if (to === "signerad") setStage(opp.orgNr, "kund", "möjlighet signerad");
    return true;
  }

  function updateOpportunity(
    id: string,
    patch: Partial<Pick<Opportunity, "title" | "value" | "expectedClose" | "temperature" | "source" | "nextStep" | "nextStepAt" | "contactId" | "ownerId">>,
  ) {
    const opp = opps.find((item) => item.id === id);
    if (!opp) return;
    if (patch.ownerId && patch.ownerId !== opp.ownerId && !isAdmin && opp.ownerId !== currentUser.id) return;
    if (patch.nextStep !== undefined && !patch.nextStep.trim() && !isOppClosed(opp.stage)) return;
    if (patch.nextStepAt !== undefined && !patch.nextStepAt && !isOppClosed(opp.stage)) return;
    const changes: string[] = [];
    if (patch.value !== undefined && patch.value !== opp.value) changes.push(`värde ${formatMoney(opp.value)} → ${formatMoney(patch.value)}`);
    if (patch.temperature && patch.temperature !== opp.temperature) changes.push(`temperatur ${opp.temperature} → ${patch.temperature}`);
    if (patch.nextStep !== undefined && patch.nextStep.trim() !== opp.nextStep) changes.push(`nästa steg: ${patch.nextStep.trim()}`);
    if (patch.nextStepAt !== undefined && patch.nextStepAt !== opp.nextStepAt) changes.push(`nästa-steg-datum ${formatStamp(patch.nextStepAt)}`);
    if (patch.expectedClose !== undefined && patch.expectedClose !== opp.expectedClose) changes.push(`förväntat avslut ${patch.expectedClose}`);
    const owner = patch.ownerId ? STAFF.find((item) => item.id === patch.ownerId) : undefined;
    if (owner && owner.id !== opp.ownerId) changes.push(`ägare ${opp.ownerName} → ${owner.name}`);
    const contact = patch.contactId !== undefined ? contacts.find((item) => item.id === patch.contactId) : undefined;
    setOpps((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...patch,
              nextStep: patch.nextStep !== undefined ? patch.nextStep.trim() : item.nextStep,
              ownerId: owner?.id ?? item.ownerId,
              ownerName: owner?.name ?? item.ownerName,
              contactId: patch.contactId !== undefined ? contact?.id ?? "" : item.contactId,
              contactName: patch.contactId !== undefined ? (contact ? `${contact.firstName} ${contact.lastName}` : "") : item.contactName,
              lastTouchAt: new Date().toISOString(),
            }
          : item,
      ),
    );
    if (changes.length) {
      logEvent(opp.orgNr, "mojlighet-andrad", { note: `${opp.title}: ${changes.join(", ")}` });
      if (owner || (patch.value !== undefined && patch.value !== opp.value)) {
        writeAudit("Ändrade möjlighet", opp.orgNr, opp.title, "", changes.join(", "));
      }
    }
  }

  function setStaleDays(days: number) {
    if (days >= 1 && days <= 60) {
      setStaleDaysState(days);
      writeStored(SETTINGS_KEY, String(days));
    }
  }

  function opportunityAlerts(forUser?: StaffId): { opp: Opportunity; flags: OppFlags }[] {
    return opps
      .filter((item) => !isOppClosed(item.stage) && (!forUser || item.ownerId === forUser))
      .map((opp) => ({ opp, flags: oppFlags(opp, now, staleDays) }))
      .filter(({ flags }) => flags.overdue || flags.stale || flags.noFollowUp)
      .sort((a, b) => Number(b.flags.overdue) - Number(a.flags.overdue) || a.opp.nextStepAt.localeCompare(b.opp.nextStepAt));
  }

  function addSegment(input: Omit<Segment, "id" | "createdBy" | "createdAt" | "archived">): string {
    const id = crypto.randomUUID();
    setSegments((current) => [
      { ...input, id, createdBy: currentUser.name, createdAt: new Date().toISOString(), archived: false },
      ...current,
    ]);
    return id;
  }

  function addToSegment(id: string, orgNrs: string[]) {
    setSegments((current) =>
      current.map((item) =>
        item.id === id && item.orgNrs ? { ...item, orgNrs: [...new Set([...item.orgNrs, ...orgNrs])] } : item,
      ),
    );
  }

  function renameSegment(id: string, name: string) {
    const clean = name.trim();
    if (clean.length < 2) return;
    setSegments((current) => current.map((item) => (item.id === id ? { ...item, name: clean } : item)));
  }

  function duplicateSegment(id: string): string {
    const copyId = crypto.randomUUID();
    setSegments((current) => {
      const source = current.find((item) => item.id === id);
      if (!source) return current;
      return [
        { ...source, id: copyId, name: `${source.name} (kopia)`, createdBy: currentUser.name, createdAt: new Date().toISOString(), archived: false },
        ...current,
      ];
    });
    return copyId;
  }

  function setSegmentArchived(id: string, archived: boolean) {
    if (!archived && !isAdmin) return;
    const name = segments.find((item) => item.id === id)?.name ?? id;
    setSegments((current) => current.map((item) => (item.id === id ? { ...item, archived } : item)));
    writeAudit(archived ? "Arkiverade segment" : "Återställde segment", "", name);
  }

  function createCallList(input: NewCallList): string {
    const id = crypto.randomUUID();
    setCallLists((current) => [
      {
        id,
        name: input.name,
        source: input.source,
        orgNrs: input.orgNrs,
        results: {},
        createdBy: currentUser.name,
        createdAt: new Date().toISOString(),
        archived: false,
      },
      ...current,
    ]);
    return id;
  }

  function addToCallList(listId: string, orgNrs: string[]) {
    setCallLists((current) =>
      current.map((item) =>
        item.id === listId ? { ...item, orgNrs: [...item.orgNrs, ...orgNrs.filter((org) => !item.orgNrs.includes(org))] } : item,
      ),
    );
  }

  function recordCallResult(listId: string, orgNr: string, outcome: CallResult["outcome"]) {
    setCallLists((current) =>
      current.map((item) =>
        item.id === listId
          ? { ...item, results: { ...item.results, [orgNr]: { outcome, at: new Date().toISOString() } } }
          : item,
      ),
    );
  }

  function restartCallList(listId: string) {
    setCallLists((current) => current.map((item) => (item.id === listId ? { ...item, results: {} } : item)));
  }

  function reopenSkipped(listId: string) {
    setCallLists((current) =>
      current.map((item) =>
        item.id === listId
          ? {
              ...item,
              results: Object.fromEntries(Object.entries(item.results).filter(([, value]) => value.outcome !== "hoppade")),
            }
          : item,
      ),
    );
  }

  function setCallListArchived(listId: string, archived: boolean) {
    if (!archived && !isAdmin) return;
    const name = callLists.find((item) => item.id === listId)?.name ?? listId;
    setCallLists((current) => current.map((item) => (item.id === listId ? { ...item, archived } : item)));
    writeAudit(archived ? "Arkiverade ringlista" : "Återställde ringlista", "", name);
  }

  function addView(input: Omit<SavedView, "id" | "userId" | "archived" | "createdAt">) {
    setViews((current) => [
      { ...input, id: crypto.randomUUID(), userId: currentUser.id, archived: false, createdAt: new Date().toISOString() },
      ...current,
    ]);
  }

  function setViewArchived(id: string, archived: boolean) {
    if (!archived && !isAdmin) return;
    setViews((current) => current.map((item) => (item.id === id ? { ...item, archived } : item)));
  }

  function saveTemplate(input: { id?: string; kind: Template["kind"]; name: string; subject: string; body: string }): string {
    if (input.id) {
      const id = input.id;
      setTemplates((current) =>
        current.map((item) => (item.id === id ? { ...item, name: input.name, subject: input.subject, body: input.body } : item)),
      );
      writeAudit("Ändrade mall", "", input.name);
      return id;
    }
    const id = crypto.randomUUID();
    setTemplates((current) => [
      { id, kind: input.kind, name: input.name, subject: input.subject, body: input.body, createdBy: currentUser.name, createdAt: new Date().toISOString(), archived: false },
      ...current,
    ]);
    return id;
  }

  function setTemplateArchived(id: string, archived: boolean) {
    if (!archived && !isAdmin) return;
    setTemplates((current) => current.map((item) => (item.id === id ? { ...item, archived } : item)));
    writeAudit(archived ? "Arkiverade mall" : "Återställde mall", "", templates.find((item) => item.id === id)?.name ?? id);
  }

  function saveDraft(input: Omit<Draft, "id" | "createdBy" | "createdAt">) {
    setDrafts((current) => [
      { ...input, id: crypto.randomUUID(), createdBy: currentUser.name, createdAt: new Date().toISOString() },
      ...current,
    ]);
    logEvent(input.orgNr, "utkast", { note: `${input.kind === "mejl" ? "Mejl" : "SMS"}-utkast${input.subject ? `: ${input.subject}` : ""}` });
  }

  function logExport(label: string, count: number, fields: string[]) {
    writeAudit("Exporterade CSV", "", label, "", `${count} bolag, fält: ${fields.join(", ")}`);
  }

  function lastActivity(orgNr: string): Activity | null {
    let best: Activity | null = null;
    for (const item of activities) {
      if (item.orgNr !== orgNr || isSystemKind(item.outcome)) continue;
      if (!best || item.at > best.at) best = item;
    }
    return best;
  }

  function openTasks(forUser?: StaffId): Task[] {
    return tasks
      .filter((item) => !item.doneAt && (!forUser || item.assignee === forUser))
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  }

  function dueReminders(forUser: StaffId): Task[] {
    return openTasks(forUser).filter((item) => new Date(item.dueAt).getTime() - item.remindMin * 60_000 <= now);
  }

  return {
    ready,
    now,
    userId,
    setUserId,
    currentUser,
    isAdmin,
    claims,
    segments,
    contacts,
    activities,
    struckPhones,
    callLists,
    metas,
    tasks,
    views,
    templates,
    drafts,
    audit,
    opps,
    staleDays,
    setStaleDays,
    addOpportunity,
    moveOpportunity,
    updateOpportunity,
    opportunityAlerts,
    metaOf,
    setStage,
    addTag,
    removeTag,
    addFlag,
    removeFlag,
    blockedChannels,
    toggleStar,
    assignOwner,
    claimMany,
    tagMany,
    addContact,
    strikeContact,
    reactivateContact,
    addContactPhone,
    addContactEmail,
    setContactPhoneStruck,
    setContactEmailStruck,
    strikePhone,
    restorePhone,
    addTask,
    completeTask,
    reopenTask,
    addActivity,
    logEvent,
    addSegment,
    addToSegment,
    renameSegment,
    duplicateSegment,
    setSegmentArchived,
    createCallList,
    addToCallList,
    recordCallResult,
    restartCallList,
    reopenSkipped,
    setCallListArchived,
    addView,
    setViewArchived,
    saveTemplate,
    setTemplateArchived,
    saveDraft,
    logExport,
    lastActivity,
    openTasks,
    dueReminders,
  };
}

const CrmContext = createContext<ReturnType<typeof useCrmState> | null>(null);

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const store = useCrmState();
  return <CrmContext.Provider value={store}>{children}</CrmContext.Provider>;
}

export function useCrmStore() {
  const store = useContext(CrmContext);
  if (!store) throw new Error("CRM-läget saknas.");
  return store;
}
