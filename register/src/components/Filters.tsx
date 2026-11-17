import { Field } from "./Shell";
import type { Filters } from "@/lib/queries";

export function FilterForm({ filters, action }: { filters: Filters; action: string }) {
  return (
    <form action={action} className="card grid gap-3 md:grid-cols-4">
      <Field label="Namn eller org.nr">
        <input name="q" defaultValue={filters.q} />
      </Field>
      <Field label="Ort">
        <input name="ort" defaultValue={filters.city} />
      </Field>
      <Field label="SNI börjar med">
        <input name="sni" defaultValue={filters.sni} />
      </Field>
      <Field label="Flagga">
        <select name="flagga" defaultValue={filters.flag}>
          <option value="">Alla</option>
          <option value="bevaka">Bevaka</option>
          <option value="prioritet">Prioritet</option>
          <option value="granska">Granska</option>
        </select>
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input className="w-auto" type="checkbox" name="telefon" value="1" defaultChecked={filters.hasPhone} />
        Har säljbart nummer
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input className="w-auto" type="checkbox" name="epost" value="1" defaultChecked={filters.hasEmail} />
        Har säljbar e-post
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input className="w-auto" type="checkbox" name="alla" value="1" defaultChecked={filters.includeSuppressed} />
        Visa även ofullständiga
      </label>
      <button type="submit">Visa urval</button>
    </form>
  );
}
