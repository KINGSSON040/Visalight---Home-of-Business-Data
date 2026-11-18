import Link from "next/link";
import { getJobSource, parseJobQuery } from "@/lib/ats";
import { t } from "@/lib/content/copy";
import { EmptyState } from "@/components/content/EmptyState";
import { JobCard } from "@/components/jobs/JobCard";
import { JobFilters } from "@/components/jobs/JobFilters";

export async function JobBrowser({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const source = await getJobSource();
  const openJobs = await source.list();
  const locations = [...new Set(openJobs.map((job) => job.location))].sort((a, b) => a.localeCompare(b, "sv"));
  const filter = parseJobQuery(await searchParams, locations);
  const jobs = await source.list(filter);
  const onlyExamples = jobs.length > 0 && jobs.every((job) => job.example);

  return (
    <div className="grid gap-10 pb-16">
      <JobFilters filter={filter} locations={locations} />
      {onlyExamples ? <p className="border-l-4 border-accent pl-4">{t("home.jobsExampleNote")}</p> : null}
      {jobs.length === 0 ? (
        <EmptyState title={t("jobs.emptyTitle")} text={t("jobs.emptyText")} />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <li key={job.slug}>
              <JobCard job={job} />
            </li>
          ))}
        </ul>
      )}
      <p>
        <Link href="/for-jobbsokande" className="text-accent underline underline-offset-4">
          {t("jobs.spontaneous")}
        </Link>
      </p>
    </div>
  );
}
