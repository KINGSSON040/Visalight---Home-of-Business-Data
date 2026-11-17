"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ORDER_STORAGE_KEY, type OrderDraft } from "@/lib/catalog";

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
};

export type ContactPhone = { id: string; value: string; struck: boolean };
export type ContactEmail = { id: string; value: string };

export type Contact = {
  id: string;
  orgNr: string;
  firstName: string;
  lastName: string;
  role: string;
  phones: ContactPhone[];
  emails: ContactEmail[];
  struck: boolean;
};

export const OUTCOMES = [
  { id: "ej-svar", label: "Ringde · ej svar" },
  { id: "svar", label: "Ringde · svar" },
  { id: "fel-person", label: "Ringde · fel person" },
  { id: "inaktivt-nummer", label: "Ringde · inaktivt nummer" },
  { id: "mailat", label: "Mailat" },
] as const;

export type OutcomeId = (typeof OUTCOMES)[number]["id"];

export type Activity = {
  id: string;
  orgNr: string;
  companyName: string;
  at: string;
  userId: StaffId;
  userName: string;
  outcome: OutcomeId;
  note: string;
  nextAt: string;
  nextNote: string;
  struckPhone: string;
};

export type Purchase = {
  id: string;
  orgNr: string;
  at: string;
  what: string;
  sum: string;
};

export type CallQueue = {
  segmentId: string;
  orgNrs: string[];
  index: number;
};

const SEGMENTS_KEY = "visalight-crm-segments";
const ACTIVITY_KEY = "visalight-crm-activity";
const LEGACY_LOG_KEY = "visalight-crm-log";
const CLAIMS_KEY = "visalight-crm-claims";
const MINE_KEY = "visalight-crm-mine";
const USER_KEY = "visalight-crm-user";
const CONTACTS_KEY = "visalight-crm-contacts";
const STRUCK_KEY = "visalight-crm-struck-phones";
const QUEUE_KEY = "visalight-crm-call";

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
  return OUTCOMES.find((item) => item.id === id)?.label ?? id;
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

export function tomorrowMorningLocal(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function readList<T>(key: string): T[] {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sameOrg(a: string, b: string): boolean {
  return a.replace(/\D/g, "") === b.replace(/\D/g, "");
}

export function readPurchases(orgNr: string): Purchase[] {
  const live = readList<OrderDraft>(ORDER_STORAGE_KEY);
  const fromOrder = live.flatMap((order) => {
    if (!order || typeof order.orgNr !== "string" || !sameOrg(order.orgNr, orgNr)) return [];
    return [
      {
        id: order.id,
        orgNr,
        at: order.createdAt,
        what: "Beställning i kassan",
        sum: order.payment === "faktura" ? "Faktura" : "Kort",
      },
    ];
  });
  const samples = SAMPLE_PURCHASES.filter((item) => sameOrg(item.orgNr, orgNr));
  return [...fromOrder, ...samples].sort((a, b) => b.at.localeCompare(a.at));
}

function normalizeSegment(raw: Partial<Segment> & { id?: string; name?: string }): Segment | null {
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
  };
}

function readClaims(): Claim[] {
  const stored = sessionStorage.getItem(CLAIMS_KEY);
  if (stored) {
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
  if (sessionStorage.getItem(ACTIVITY_KEY)) return current;
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
  const stored = sessionStorage.getItem(USER_KEY);
  return STAFF.find((staff) => staff.id === stored)?.id ?? STAFF[0].id;
}

function useCrmState() {
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<StaffId>(STAFF[0].id);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [struckPhones, setStruckPhones] = useState<{ orgNr: string; value: string }[]>([]);
  const [queue, setQueue] = useState<CallQueue | null>(null);

  useEffect(() => {
    setUserId(readUserId());
    setClaims(readClaims());
    setSegments(readList<Partial<Segment>>(SEGMENTS_KEY).flatMap((item) => {
      const segment = normalizeSegment(item);
      return segment ? [segment] : [];
    }));
    setContacts(readList<Contact>(CONTACTS_KEY));
    setActivities(readActivities());
    setStruckPhones(readList<{ orgNr: string; value: string }>(STRUCK_KEY));
    const storedQueue = sessionStorage.getItem(QUEUE_KEY);
    if (storedQueue) {
      try {
        setQueue(JSON.parse(storedQueue) as CallQueue);
      } catch {
        setQueue(null);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    sessionStorage.setItem(USER_KEY, userId);
  }, [userId, ready]);

  useEffect(() => {
    if (!ready) return;
    sessionStorage.setItem(CLAIMS_KEY, JSON.stringify(claims));
  }, [claims, ready]);

  useEffect(() => {
    if (!ready) return;
    sessionStorage.setItem(SEGMENTS_KEY, JSON.stringify(segments));
  }, [segments, ready]);

  useEffect(() => {
    if (!ready) return;
    sessionStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  }, [contacts, ready]);

  useEffect(() => {
    if (!ready) return;
    sessionStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities));
  }, [activities, ready]);

  useEffect(() => {
    if (!ready) return;
    sessionStorage.setItem(STRUCK_KEY, JSON.stringify(struckPhones));
  }, [struckPhones, ready]);

  useEffect(() => {
    if (!ready) return;
    if (queue) sessionStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }, [queue, ready]);

  const currentUser = STAFF.find((person) => person.id === userId) ?? STAFF[0];

  function toggleStar(orgNr: string) {
    setClaims((current) => {
      const existing = current.find((item) => item.orgNr === orgNr);
      if (existing && existing.userId !== userId) return current;
      if (existing) return current.filter((item) => item.orgNr !== orgNr);
      return [{ orgNr, userId: currentUser.id, userName: currentUser.name, at: new Date().toISOString() }, ...current];
    });
  }

  function addContact(contact: Contact) {
    setContacts((current) => [contact, ...current]);
  }

  function strikeContact(id: string) {
    setContacts((current) => current.map((item) => (item.id === id ? { ...item, struck: true } : item)));
  }

  function addContactPhone(contactId: string, value: string) {
    setContacts((current) =>
      current.map((item) =>
        item.id === contactId
          ? { ...item, phones: [...item.phones, { id: crypto.randomUUID(), value, struck: false }] }
          : item,
      ),
    );
  }

  function addContactEmail(contactId: string, value: string) {
    setContacts((current) =>
      current.map((item) =>
        item.id === contactId ? { ...item, emails: [...item.emails, { id: crypto.randomUUID(), value }] } : item,
      ),
    );
  }

  function strikePhone(orgNr: string, value: string, contactId?: string, phoneId?: string) {
    if (contactId && phoneId) {
      setContacts((current) =>
        current.map((item) =>
          item.id === contactId
            ? { ...item, phones: item.phones.map((phone) => (phone.id === phoneId ? { ...phone, struck: true } : phone)) }
            : item,
        ),
      );
    }
    setStruckPhones((current) =>
      current.some((item) => item.orgNr === orgNr && item.value === value) ? current : [...current, { orgNr, value }],
    );
  }

  function addActivity(entry: Activity) {
    setActivities((current) => [entry, ...current]);
  }

  function saveQueue(next: CallQueue) {
    setQueue(next);
  }

  return {
    ready,
    userId,
    setUserId,
    currentUser,
    claims,
    segments,
    setSegments,
    contacts,
    activities,
    struckPhones,
    queue,
    toggleStar,
    addContact,
    strikeContact,
    addContactPhone,
    addContactEmail,
    strikePhone,
    addActivity,
    saveQueue,
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
