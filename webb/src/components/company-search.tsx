"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  COUNTIES,
  EMPLOYEE_BANDS,
  FORM_GROUPS,
  LEGAL_FORMS,
  SUGGESTION_KIND_LABEL,
  formGroupLabel,
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
  live = false,
  beforeForms,
  queryPlaceholder = "Bransch, SNI, namn eller organisationsnummer",
  querySuggestions = suggestQuery,
  children,
}: {
  draft: Selection;
  onChange: (patch: Partial<Selection>) => void;
  onSearch: () => void;
  onClear: () => void;
  split?: boolean;
  hint?: string;
  live?: boolean;
  beforeForms?: ReactNode;
  queryPlaceholder?: string;
  querySuggestions?: (text: string) => Suggestion[];
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

  function toggleGroup(codes: string[]) {
    const some = codes.some((code) => forms.includes(code));
    onChange({
      forms: some
        ? forms.filter((code) => !codes.includes(code))
        : [...forms, ...codes.filter((code) => !forms.includes(code))],
    });
  }

  return (
    <form
      className={split ? "flex min-h-0 flex-1 flex-col" : "min-w-0"}
      onSubmit={(event) => {
        event.preventDefault();
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        onSearch();
      }}
    >
      <div className={split ? "min-h-0 flex-1 overflow-y-auto pb-3" : "min-w-0"}>
      <SuggestField
        label="Sök"
        value={draft.query}
        placeholder={queryPlaceholder}
        suggestions={querySuggestions(draft.query)}
        onValue={(query) => onChange({ query })}
        onPick={applySuggestion}
        dense={live}
      />

      <div className={`grid sm:grid-cols-2 ${live ? "mt-1.5 gap-2" : "mt-3 gap-3"}`}>
        <SuggestField
          label="Ort"
          value={draft.city}
          placeholder="Ort, till exempel Malmö"
          suggestions={suggestCities(draft.city)}
          onValue={(city) => onChange({ city })}
          onPick={applySuggestion}
          dense={live}
        />
        <SuggestField
          label="Bransch"
          value={draft.bransch ?? ""}
          placeholder="Bransch eller SNI"
          suggestions={suggestIndustries(draft.bransch ?? "")}
          onValue={(bransch) => onChange({ bransch, sni: "" })}
          onPick={applySuggestion}
          dense={live}
        />
      </div>

      {beforeForms}

      {live ? (
        <div className="mt-1.5 grid grid-cols-1 gap-2 min-[480px]:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <FormPicker forms={forms} onToggle={toggleGroup} />
          <CountyField value={draft.county ?? ""} onChange={(county) => onChange({ county })} dense />
          <EmployeeField value={draft.employees ?? ""} onChange={(employees) => onChange({ employees })} dense />
        </div>
      ) : (
        <>
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
                      pressed ? "btn-fade-sea border-transparent text-white" : "border-line bg-white text-ink"
                    }`}
                  >
                    {form.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <CountyField value={draft.county ?? ""} onChange={(county) => onChange({ county })} />
            <EmployeeField value={draft.employees ?? ""} onChange={(employees) => onChange({ employees })} />
          </div>
        </>
      )}
        {children}
      </div>

      <div className={split ? "shrink-0 border-t border-line bg-white pt-3" : live ? "mt-1.5" : "mt-3"}>
        <div className={`flex gap-2 ${live ? "items-center" : "flex-col sm:flex-row"}`}>
          {live ? null : (
            <button
              type="submit"
              onMouseDown={(event) => event.preventDefault()}
              className="btn-fade-sea h-12 flex-1 rounded-full bg-sea font-medium text-white"
            >
              Sök bolag
            </button>
          )}
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClear}
            className={`btn-fade-white rounded-full border border-line font-medium ${live ? "h-8 px-3 text-xs" : "h-12 px-4 text-sm"}`}
          >
            Rensa
          </button>
          {live && hint ? (
            <p className="min-w-0 flex-1 text-xs leading-5 text-muted" aria-live="polite">
              {hint}
            </p>
          ) : null}
        </div>
        {!live && hint ? (
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
  dense = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  suggestions: Suggestion[];
  onValue: (value: string) => void;
  onPick: (suggestion: Suggestion) => void;
  dense?: boolean;
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
    <label className={`relative block text-sm ${open ? "z-20" : ""}`} htmlFor={id}>
      <span className={`block font-medium ${dense ? "mb-0.5 text-xs leading-4" : "mb-1.5"}`}>{label}</span>
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
        className={`w-full rounded-xl border border-line bg-paper px-3 placeholder:text-ink/40 ${dense ? "h-10 text-sm" : "h-12 text-base"}`}
      />
      {open && visible.length > 0 ? (
        <ul id={listId} role="listbox" className="absolute z-30 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-line bg-white shadow-lg">
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
          Inget förslag matchar.
        </p>
      ) : null}
    </label>
  );
}

function CountyField({
  value,
  onChange,
  dense = false,
}: {
  value: string;
  onChange: (county: string) => void;
  dense?: boolean;
}) {
  return (
    <label className="block min-w-0 text-sm">
      <span className={`block font-medium ${dense ? "mb-0.5 text-xs leading-4" : "mb-1.5"}`}>Län</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full min-w-0 rounded-xl border border-line bg-paper px-3 ${dense ? "h-10 text-sm" : "h-12 text-base"}`}
      >
        <option value="">Alla län</option>
        {COUNTIES.map((item) => (
          <option key={item.code} value={item.label}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function EmployeeField({
  value,
  onChange,
  dense = false,
}: {
  value: string;
  onChange: (employees: string) => void;
  dense?: boolean;
}) {
  return (
    <label className="block min-w-0 text-sm">
      <span className={`block font-medium ${dense ? "mb-0.5 text-xs leading-4" : "mb-1.5"}`}>Anställda</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full min-w-0 rounded-xl border border-line bg-paper px-3 ${dense ? "h-10 text-sm" : "h-12 text-base"}`}
      >
        <option value="">Alla storlekar</option>
        {EMPLOYEE_BANDS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}

function FormPicker({ forms, onToggle }: { forms: string[]; onToggle: (codes: string[]) => void }) {
  const labelId = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const summary = formGroupLabel(forms);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative min-w-0 text-sm ${open ? "z-30" : ""}`}>
      <span id={labelId} className="mb-0.5 block text-xs leading-4 font-medium">
        Bolagsform
      </span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-line bg-paper px-3 text-left text-sm"
      >
        <span className="truncate">{summary}</span>
        <span aria-hidden="true" className="shrink-0 text-xs text-muted">
          ▾
        </span>
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label="Bolagsform"
          aria-multiselectable="true"
          className="absolute right-0 left-0 z-30 mt-1 rounded-xl border border-line bg-white p-1 shadow-lg"
        >
          {FORM_GROUPS.map((group) => {
            const all = group.codes.every((code) => forms.includes(code));
            const some = group.codes.some((code) => forms.includes(code));
            return (
              <li key={group.label} role="option" aria-selected={some}>
                <label className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-foam">
                  <input
                    type="checkbox"
                    checked={all}
                    ref={(node) => {
                      if (node) node.indeterminate = some && !all;
                    }}
                    onChange={() => onToggle(group.codes)}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-sea"
                  />
                  <span className="min-w-0">{group.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
