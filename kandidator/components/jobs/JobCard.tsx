import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { t } from "@/lib/content/copy";
import type { Job } from "@/lib/content/types";
import { employmentLabel, locationTypeLabel, workloadLabel } from "@/lib/labels";
import { formatSwedishDate } from "@/lib/content/types";

export function JobMeta({ job, compact = false }: { job: Job; compact?: boolean }) {
  const facts = [
    job.company,
    `${job.location}, ${locationTypeLabel(job.locationType)}`,
    `${employmentLabel(job.employment)}, ${workloadLabel(job.workload)}`,
  ];
  if (compact) {
    return <p className="text-muted-foreground">{facts.join(" · ")}</p>;
  }
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      <div>
        <dt className="font-semibold">{t("jobs.metaCompany")}</dt>
        <dd>{job.company}</dd>
      </div>
      <div>
        <dt className="font-semibold">{t("jobs.metaLocation")}</dt>
        <dd>
          {job.location}, {locationTypeLabel(job.locationType)}
        </dd>
      </div>
      <div>
        <dt className="font-semibold">{t("jobs.metaEmployment")}</dt>
        <dd>
          {employmentLabel(job.employment)}, {workloadLabel(job.workload)}
        </dd>
      </div>
      <div>
        <dt className="font-semibold">{t("jobs.metaPublished")}</dt>
        <dd>{formatSwedishDate(job.publishedAt)}</dd>
      </div>
      {job.applyBy ? (
        <div>
          <dt className="font-semibold">{t("jobs.metaApplyBy")}</dt>
          <dd>{formatSwedishDate(job.applyBy)}</dd>
        </div>
      ) : null}
    </dl>
  );
}

export function JobCard({ job }: { job: Job }) {
  return (
    <article className="h-full rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-2">
        {job.example ? <Badge>{t("jobs.exampleBadge")}</Badge> : null}
        <p className="text-muted-foreground">{formatSwedishDate(job.publishedAt)}</p>
      </div>
      <h3 className="mt-3 text-2xl">
        <Link href={`/lediga-jobb/${job.slug}`} className="text-foreground no-underline">
          {job.title}
        </Link>
      </h3>
      <p className="mt-3">{job.summary}</p>
      <div className="mt-4">
        <JobMeta job={job} compact />
      </div>
    </article>
  );
}
