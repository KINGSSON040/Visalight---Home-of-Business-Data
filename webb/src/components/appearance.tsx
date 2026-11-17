"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_FILTER,
  DEFAULT_THEME,
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
      </div>
    </AppearanceContext.Provider>
  );
}
