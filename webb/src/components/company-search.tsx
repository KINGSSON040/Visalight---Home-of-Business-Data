"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import {
  LEGAL_FORMS,
  SUGGESTION_KIND_LABEL,
  suggestCities,
  suggestIndustries,
  suggestQuery,
  type Selection,
  type Suggestion,
} from "@/lib/catalog";

export function CompanySearch({
  draft,
  onChange,
  onSearch,
  onClear,
  split = false,
  hint,
  children,
}: {
  draft: Selection;
  onChange: (patch: Partial<Selection>) => void;
  onSearch: () => void;
  onClear: () => void;
  split?: boolean;
  hint?: string;
  children?: ReactNode;
}) {
  const forms = draft.forms ?? [];

  function applySuggestion(suggestion: Suggestion) {
    const { form, ...rest } = suggestion.apply;
    const patch: Partial<Selection> = { ...rest };
    if (form) {
      patch.forms = forms.includes(form) ? forms : [...forms, form];
    }
    onChange(patch);
  }

  function toggleForm(code: string) {
    onChange({
      forms: forms.includes(code) ? forms.filter((item) => item !== code) : [...forms, code],
    });
  }

  return (
    <form
      className={split ? "flex min-h-0 flex-1 flex-col" : undefined}
      onSubmit={(event) => {
        event.preventDefault();
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        onSearch();
      }}
    >
      <div className={split ? "min-h-0 flex-1 overflow-y-auto pb-3" : undefined}>
      <SuggestField
        label="Sök"
        value={draft.query}
        placeholder="Bransch, SNI, namn eller organisationsnummer"
        suggestions={suggestQuery(draft.query)}
        onValue={(query) => onChange({ query })}
        onPick={applySuggestion}
      />

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <SuggestField
          label="Ort"
          value={draft.city}
          placeholder="Ort, till exempel Malmö"
          suggestions={suggestCities(draft.city)}
          onValue={(city) => onChange({ city })}
          onPick={applySuggestion}
        />
        <SuggestField
          label="Bransch"
          value={draft.bransch ?? ""}
          placeholder="Bransch eller SNI"
          suggestions={suggestIndustries(draft.bransch ?? "")}
          onValue={(bransch) => onChange({ bransch, sni: "" })}
          onPick={applySuggestion}
        />
      </div>

      <fieldset className="mt-3">
        <legend className="text-sm font-medium">Bolagsform</legend>
        <p className="mt-1 text-xs leading-5 text-muted">Inget val betyder alla bolagsformer som förekommer i Sverige.</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {LEGAL_FORMS.map((form) => {
            const pressed = forms.includes(form.code);
            return (
              <button
                key={form.code}
                type="button"
                aria-pressed={pressed}
                onClick={() => toggleForm(form.code)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                  pressed ? "border-sea bg-sea text-white" : "border-line bg-white text-ink"
                }`}
              >
                {form.label}
              </button>
            );
          })}
        </div>
      </fieldset>
        {children}
      </div>

      <div className={split ? "shrink-0 border-t border-line bg-white pt-3" : "mt-3"}>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            onMouseDown={(event) => event.preventDefault()}
            className="h-12 flex-1 rounded-full bg-amber font-medium text-ink"
          >
            Sök bolag
          </button>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClear}
            className="h-12 rounded-full border border-line bg-white px-4 text-sm font-medium"
          >
            Rensa
          </button>
        </div>
        {hint ? (
          <p className="mt-2 text-sm leading-6 text-muted" aria-live="polite">
            {hint}
          </p>
        ) : null}
      </div>
    </form>
  );
}

function SuggestField({
  label,
  value,
  placeholder,
  suggestions,
  onValue,
  onPick,
}: {
  label: string;
  value: string;
  placeholder: string;
  suggestions: Suggestion[];
  onValue: (value: string) => void;
  onPick: (suggestion: Suggestion) => void;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [highlighted, setHighlighted] = useState(false);
  const showList = open && (value.trim().length > 0 || suggestions.length > 0);
  const visible = open ? suggestions : [];

  useEffect(() => {
    setActive(0);
    setHighlighted(false);
  }, [value]);

  function pick(suggestion: Suggestion) {
    onPick(suggestion);
    setOpen(false);
  }

  return (
    <label className="block text-sm" htmlFor={id}>
      <span className="mb-1.5 block font-medium">{label}</span>
      <input
        id={id}
        value={value}
        role="combobox"
        aria-expanded={open && visible.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onChange={(event) => {
          onValue(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            if (suggestions.length === 0) return;
            setOpen(true);
            setHighlighted(true);
            setActive((current) => (highlighted ? Math.min(suggestions.length - 1, current + 1) : 0));
            return;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            if (suggestions.length === 0) return;
            setOpen(true);
            setHighlighted(true);
            setActive((current) => Math.max(0, current - 1));
            return;
          }
          if (event.key === "Escape") {
            setOpen(false);
            setHighlighted(false);
            return;
          }
          if (event.key === "Enter" && highlighted && suggestions[active]) {
            event.preventDefault();
            pick(suggestions[active]);
          }
        }}
        className="h-12 w-full rounded-xl border border-line bg-paper px-3 text-base"
      />
      {open && visible.length > 0 ? (
        <ul id={listId} role="listbox" className="mt-1 max-h-56 overflow-y-auto rounded-xl border border-line bg-white">
          {visible.map((suggestion, index) => {
            const previous = visible[index - 1];
            const showKind = !previous || previous.kind !== suggestion.kind;
            return (
              <li key={suggestion.id} role="presentation">
                {showKind ? (
                  <p className="px-3 pt-2 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-sea">
                    {SUGGESTION_KIND_LABEL[suggestion.kind]}
                  </p>
                ) : null}
                <button
                  type="button"
                  role="option"
                  aria-selected={highlighted && index === active}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => pick(suggestion)}
                  className={`flex w-full flex-col px-3 py-2 text-left ${highlighted && index === active ? "bg-foam" : "bg-white"}`}
                >
                  <span className="font-medium">{suggestion.title}</span>
                  <span className="text-xs leading-5 text-muted">{suggestion.detail}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {showList && value.trim() && visible.length === 0 ? (
        <p className="mt-1 rounded-xl border border-line bg-white px-3 py-2 text-sm text-muted">
          Inget i exempelregistret matchar.
        </p>
      ) : null}
    </label>
  );
}
