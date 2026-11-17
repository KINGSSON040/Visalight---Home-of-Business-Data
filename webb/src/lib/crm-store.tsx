"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { COMPANIES, ORDER_STORAGE_KEY, type OrderDraft } from "@/lib/catalog";

export const STAFF = [
  { id: "anna", name: "Anna Berg" },
  { id: "erik", name: "Erik Holm" },
  { id: "mira", name: "Mira Lind" },
] as const;

export type StaffId = (typeof STAFF)[number]["id"];

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
  { id: "ej-svar", label: "Ringde · ej svar", short: "Ej svar", tone: "neutral", call: true },
  { id: "svar", label: "Ringde · svar", short: "Svar", tone: "good", call: true },
  { id: "ring-igen", label: "Ringde · ring igen", short: "Ring igen", tone: "warm", call: true },
  { id: "intresserad", label: "Intresserad", short: "Intresserad", tone: "good", call: true },
  { id: "mote", label: "Möte bokat", short: "Möte bokat", tone: "good", call: true },
  { id: "ej-intresserad", label: "Ej intresserad", short: "Ej intresserad", tone: "bad", call: true },
  { id: "fel-person", label: "Ringde · fel person", short: "Fel person", tone: "neutral", call: true },
  { id: "inaktivt-nummer", label: "Ringde · inaktivt nummer", short: "Inaktivt nummer", tone: "bad", call: true },
  { id: "mailat", label: "Mailat", short: "Mailat", tone: "neutral", call: false },
  { id: "sms", label: "SMS skickat", short: "SMS", tone: "neutral", call: false },
  { id: "anteckning", label: "Anteckning", short: "Anteckning", tone: "neutral", call: false },
] as const;

export const SYSTEM_EVENTS = {
  "agare-satt": "Stjärnmärkte bolaget",
  "agare-slappt": "Tog bort stjärnan",
} as const;

export type OutcomeId = (typeof OUTCOMES)[number]["id"];
export type ActivityKind = OutcomeId | keyof typeof SYSTEM_EVENTS;

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

const SEGMENTS_KEY = "visalight-crm-segments";
const ACTIVITY_KEY = "visalight-crm-activity";
const LEGACY_LOG_KEY = "visalight-crm-log";
const CLAIMS_KEY = "visalight-crm-claims";
const MINE_KEY = "visalight-crm-mine";
const USER_KEY = "visalight-crm-user";
const CONTACTS_KEY = "visalight-crm-contacts";
const STRUCK_KEY = "visalight-crm-struck-phones";
const CALLLISTS_KEY = "visalight-crm-calllists";

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

function useCrmState() {
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<StaffId>(STAFF[0].id);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [struckPhones, setStruckPhones] = useState<{ orgNr: string; value: string }[]>([]);
  const [callLists, setCallLists] = useState<CallList[]>([]);
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
    setActivities(readActivities());
    setStruckPhones(readList<{ orgNr: string; value: string }>(STRUCK_KEY));
    setCallLists(
      readList<CallList>(CALLLISTS_KEY).filter(
        (item) => item && item.id && Array.isArray(item.orgNrs) && item.results && typeof item.results === "object",
      ),
    );
    setReady(true);
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

  const currentUser = STAFF.find((person) => person.id === userId) ?? STAFF[0];

  function logEvent(orgNr: string, kind: ActivityKind, extra: Partial<Activity> = {}) {
    const name = COMPANIES.find((item) => item.orgNr === orgNr)?.name ?? orgNr;
    setActivities((current) => [
      {
        id: crypto.randomUUID(),
        orgNr,
        companyName: name,
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

  function toggleStar(orgNr: string) {
    const existing = claimsRef.current.find((item) => item.orgNr === orgNr);
    if (existing && existing.userId !== userId) return;
    if (existing) {
      setClaims((current) => current.filter((item) => item.orgNr !== orgNr));
      logEvent(orgNr, "agare-slappt");
      return;
    }
    setClaims((current) => [
      { orgNr, userId: currentUser.id, userName: currentUser.name, at: new Date().toISOString() },
      ...current,
    ]);
    logEvent(orgNr, "agare-satt");
  }

  function addContact(contact: Omit<Contact, "createdAt" | "createdBy" | "struckAt" | "struckBy">) {
    setContacts((current) => [
      { ...contact, struckAt: "", struckBy: "", createdAt: new Date().toISOString(), createdBy: currentUser.name },
      ...current,
    ]);
  }

  function patchContact(id: string, change: (item: Contact) => Contact) {
    setContacts((current) => current.map((item) => (item.id === id ? change(item) : item)));
  }

  function strikeContact(id: string) {
    patchContact(id, (item) => ({
      ...item,
      struck: true,
      struckAt: new Date().toISOString(),
      struckBy: currentUser.name,
    }));
  }

  function reactivateContact(id: string) {
    patchContact(id, (item) => ({ ...item, struck: false, struckAt: "", struckBy: "" }));
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
    patchContact(contactId, (item) => ({
      ...item,
      phones: item.phones.map((phone) => (phone.id === phoneId ? { ...phone, struck } : phone)),
    }));
  }

  function setContactEmailStruck(contactId: string, emailId: string, struck: boolean) {
    patchContact(contactId, (item) => ({
      ...item,
      emails: item.emails.map((mail) => (mail.id === emailId ? { ...mail, struck } : mail)),
    }));
  }

  function strikePhone(orgNr: string, value: string, contactId?: string, phoneId?: string) {
    if (contactId && phoneId) setContactPhoneStruck(contactId, phoneId, true);
    setStruckPhones((current) =>
      current.some((item) => item.orgNr === orgNr && item.value === value) ? current : [...current, { orgNr, value }],
    );
  }

  function restorePhone(orgNr: string, value: string) {
    setStruckPhones((current) => current.filter((item) => !(item.orgNr === orgNr && item.value === value)));
  }

  function addActivity(entry: Activity) {
    setActivities((current) => [entry, ...current]);
  }

  function addSegment(input: Omit<Segment, "id" | "createdBy" | "createdAt" | "archived">): string {
    const id = crypto.randomUUID();
    setSegments((current) => [
      { ...input, id, createdBy: currentUser.name, createdAt: new Date().toISOString(), archived: false },
      ...current,
    ]);
    return id;
  }

  function setSegmentArchived(id: string, archived: boolean) {
    setSegments((current) => current.map((item) => (item.id === id ? { ...item, archived } : item)));
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
    setCallLists((current) => current.map((item) => (item.id === listId ? { ...item, archived } : item)));
  }

  function lastActivity(orgNr: string): Activity | null {
    let best: Activity | null = null;
    for (const item of activities) {
      if (item.orgNr !== orgNr || item.outcome === "agare-satt" || item.outcome === "agare-slappt") continue;
      if (!best || item.at > best.at) best = item;
    }
    return best;
  }

  /** En planerad uppföljning räknas som öppen tills något nyare har loggats på bolaget. */
  function openTasks(forUser?: StaffId): Activity[] {
    return activities
      .filter((item) => {
        if (!item.nextAt) return false;
        if (forUser && item.userId !== forUser) return false;
        return !activities.some(
          (other) =>
            other.orgNr === item.orgNr &&
            other.at > item.at &&
            other.outcome !== "agare-satt" &&
            other.outcome !== "agare-slappt",
        );
      })
      .sort((a, b) => a.nextAt.localeCompare(b.nextAt));
  }

  return {
    ready,
    userId,
    setUserId,
    currentUser,
    claims,
    segments,
    contacts,
    activities,
    struckPhones,
    callLists,
    toggleStar,
    addContact,
    strikeContact,
    reactivateContact,
    addContactPhone,
    addContactEmail,
    setContactPhoneStruck,
    setContactEmailStruck,
    strikePhone,
    restorePhone,
    addActivity,
    addSegment,
    setSegmentArchived,
    createCallList,
    recordCallResult,
    restartCallList,
    reopenSkipped,
    setCallListArchived,
    lastActivity,
    openTasks,
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
