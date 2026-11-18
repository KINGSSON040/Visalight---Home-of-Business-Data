import Link from "next/link";
import { jobQueryHref } from "@/lib/ats";
import { t } from "@/lib/content/copy";
import { employmentTypes, roleSlugs, serviceSlugs, type JobFilter } from "@/lib/content/types";
import { employmentLabel, roleLabel, serviceLabel } from "@/lib/labels";

function FilterLinks({
  label,
  current,
  options,
  set,
}: {
  label: string;
  current?: string;
  options: { value: string; label: string }[];
  set: (value?: string) => JobFilter;
}) {
  return (
    <div>
      <h3 className="text-xl">{label}</h3>
      <ul className="mt-2 flex flex-wrap gap-2">
        <li>
          <Link
            href={jobQueryHref(set(undefined))}
            aria-current={current ? undefined : "true"}
            className="inline-flex min-h-11 items-center rounded-md border border-border px-3"
          >
            {t("jobs.all")}
          </Link>
        </li>
        {options.map((option) => (
          <li key={option.value}>
            <Link
              href={jobQueryHref(set(option.value))}
              aria-current={current === option.value ? "true" : undefined}
              className="inline-flex min-h-11 items-center rounded-md border border-border px-3"
            >
              {option.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function JobFilters({ filter, locations }: { filter: JobFilter; locations: string[] }) {
  const active = Boolean(filter.role || filter.location || filter.employment || filter.service);
  return (
    <section className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl">{t("jobs.filtersTitle")}</h2>
        {active ? (
          <Link href="/lediga-jobb" className="text-accent underline underline-offset-4">
            {t("jobs.clear")}
          </Link>
        ) : null}
      </div>
      <FilterLinks
        label={t("jobs.role")}
        current={filter.role}
        options={roleSlugs.map((value) => ({ value, label: roleLabel(value) }))}
        set={(value) => ({ ...filter, role: value as JobFilter["role"] })}
      />
      {locations.length > 0 ? (
        <FilterLinks
          label={t("jobs.location")}
          current={filter.location}
          options={locations.map((value) => ({ value, label: value }))}
          set={(value) => ({ ...filter, location: value })}
        />
      ) : null}
      <FilterLinks
        label={t("jobs.employment")}
        current={filter.employment}
        options={employmentTypes.map((value) => ({ value, label: employmentLabel(value) }))}
        set={(value) => ({ ...filter, employment: value as JobFilter["employment"] })}
      />
      <FilterLinks
        label={t("jobs.service")}
        current={filter.service}
        options={serviceSlugs.map((value) => ({ value, label: serviceLabel(value) }))}
        set={(value) => ({ ...filter, service: value as JobFilter["service"] })}
      />
    </section>
  );
}
