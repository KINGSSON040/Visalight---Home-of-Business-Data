"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_FILTER,
  DEFAULT_THEME,
  FILTERS,
  THEMES,
  filterFromParam,
  themeFromParam,
  type FilterId,
  type ThemeId,
} from "@/lib/appearance";

type AppearanceValue = {
  theme: ThemeId;
  filter: FilterId;
  setTheme: (theme: ThemeId) => void;
  setFilter: (filter: FilterId) => void;
};

const AppearanceContext = createContext<AppearanceValue | null>(null);

export function useAppearance(): AppearanceValue {
  const value = useContext(AppearanceContext);
  if (value) return value;
  return {
    theme: DEFAULT_THEME,
    filter: DEFAULT_FILTER,
    setTheme: () => undefined,
    setFilter: () => undefined,
  };
}

function readUrl() {
  const params = new URLSearchParams(window.location.search);
  const storedTheme = window.localStorage.getItem("visalight-tema");
  const storedFilter = window.localStorage.getItem("visalight-filter");
  return {
    theme: themeFromParam(params.get("tema") ?? storedTheme),
    filter: filterFromParam(params.get("filter") ?? storedFilter),
  };
}

function writeUrl(theme: ThemeId, filter: FilterId) {
  const params = new URLSearchParams(window.location.search);
  if (theme === DEFAULT_THEME) params.delete("tema");
  else params.set("tema", theme);
  if (filter === DEFAULT_FILTER) params.delete("filter");
  else params.set("filter", filter);
  const query = params.toString();
  const next = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", next);
  window.localStorage.setItem("visalight-tema", theme);
  window.localStorage.setItem("visalight-filter", filter);
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);
  const [filter, setFilterState] = useState<FilterId>(DEFAULT_FILTER);

  useEffect(() => {
    const initial = readUrl();
    setThemeState(initial.theme);
    setFilterState(initial.filter);
    window.localStorage.setItem("visalight-tema", initial.theme);
    window.localStorage.setItem("visalight-filter", initial.filter);
    delete document.documentElement.dataset.theme;
  }, []);

  const value = useMemo<AppearanceValue>(
    () => ({
      theme,
      filter,
      setTheme: (next) => {
        setThemeState(next);
        writeUrl(next, filter);
      },
      setFilter: (next) => {
        setFilterState(next);
        writeUrl(theme, next);
      },
    }),
    [theme, filter],
  );

  return (
    <AppearanceContext.Provider value={value}>
      <div className="customer-site" data-theme={theme} data-filter={filter}>
        {children}
        <AppearanceBar />
      </div>
    </AppearanceContext.Provider>
  );
}

function AppearanceBar() {
  const { theme, filter, setTheme, setFilter } = useAppearance();
  const [open, setOpen] = useState(false);
  const current = THEMES.find((item) => item.id === theme) ?? THEMES[0];

  return (
    <div className="fixed right-3 bottom-3 z-50 max-w-[calc(100vw-1.5rem)]">
      {open ? (
        <div className="mb-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-line bg-card p-3 text-ink shadow-xl">
          <p className="text-sm font-semibold">Prova utseende</p>
          <ul className="mt-2 grid gap-1">
            {THEMES.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setTheme(item.id)}
                  className={`w-full rounded-xl px-2 py-1.5 text-left ${item.id === theme ? "bg-foam" : "hover:bg-paper"}`}
                  aria-pressed={item.id === theme}
                >
                  <span className="block text-sm font-medium">{item.name}</span>
                  <span className="block text-xs leading-4 text-muted">{item.intent}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm font-semibold">Så väljer ni filter</p>
          <ul className="mt-2 grid gap-1">
            {FILTERS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`w-full rounded-xl px-2 py-1.5 text-left ${item.id === filter ? "bg-foam" : "hover:bg-paper"}`}
                  aria-pressed={item.id === filter}
                >
                  <span className="block text-sm font-medium">{item.name}</span>
                  <span className="block text-xs leading-4 text-muted">{item.intent}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="btn-fade-amber h-11 rounded-full bg-amber px-4 text-sm font-semibold text-ink shadow-lg"
      >
        Prova utseende · {current.name}
      </button>
    </div>
  );
}
