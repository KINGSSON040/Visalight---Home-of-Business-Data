"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { t } from "@/lib/content/copy";
import { readConsentFromDocument, writeConsentCookie, type ConsentValue } from "@/lib/consent";

type ConsentContextValue = {
  value: ConsentValue | null;
  ready: boolean;
  bannerOpen: boolean;
  choose: (value: ConsentValue) => void;
  openSettings: () => void;
};

type ConsentSnapshot = {
  value: ConsentValue | null;
  ready: boolean;
  bannerOpen: boolean;
};

const serverSnapshot: ConsentSnapshot = { value: null, ready: false, bannerOpen: false };
let bannerOverride: boolean | null = null;
let snapshot: ConsentSnapshot = serverSnapshot;
const listeners = new Set<() => void>();

function currentSnapshot(): ConsentSnapshot {
  const value = readConsentFromDocument();
  return {
    value,
    ready: true,
    bannerOpen: bannerOverride ?? value === null,
  };
}

function publish() {
  snapshot = currentSnapshot();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  if (!snapshot.ready) snapshot = currentSnapshot();
  return snapshot;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const current = useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);

  function choose(next: ConsentValue) {
    const previous = getSnapshot().value;
    writeConsentCookie(next);
    bannerOverride = null;
    publish();
    toast(t("cookies.saved"));
    if (previous && previous !== next) {
      window.location.reload();
    }
  }

  return (
    <ConsentContext.Provider
      value={{
        value: current.value,
        ready: current.ready,
        bannerOpen: current.bannerOpen,
        choose,
        openSettings: () => {
          bannerOverride = true;
          publish();
        },
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("Consent saknas");
  }
  return context;
}
