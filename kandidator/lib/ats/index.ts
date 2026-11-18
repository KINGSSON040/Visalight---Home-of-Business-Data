import "server-only";

import { readAllJobs } from "@/lib/content/read";
import type { Job, JobFilter, Submission } from "@/lib/content/types";
import { isEmployment, isRoleSlug, isServiceSlug } from "@/lib/content/types";

export interface JobSource {
  list(filter?: JobFilter): Promise<Job[]>;
  getBySlug(slug: string): Promise<Job | null>;
  /** Non-draft slugs, including closed ads, so filled roles keep a URL. */
  publishedSlugs(): Promise<string[]>;
}

export interface ApplicationTarget {
  submit(application: Submission): Promise<void>;
}

export const localJobSource: JobSource = {
  async list(filter: JobFilter = {}) {
    const jobs = await readAllJobs();
    return jobs.filter((job) => {
      if (job.draft || job.status !== "open") return false;
      if (filter.role && job.role !== filter.role) return false;
      if (filter.service && job.service !== filter.service) return false;
      if (filter.employment && job.employment !== filter.employment) return false;
      if (filter.location && job.location !== filter.location) return false;
      return true;
    });
  },
  async getBySlug(slug: string) {
    const jobs = await readAllJobs();
    const job = jobs.find((item) => item.slug === slug);
    if (!job || job.draft) return null;
    return job;
  },
  async publishedSlugs() {
    const jobs = await readAllJobs();
    return jobs.filter((job) => !job.draft).map((job) => job.slug);
  },
};

function provider(): string {
  return process.env.ATS_PROVIDER?.trim() || "local";
}

function assertProvider(): void {
  const value = provider();
  if (value === "teamtailor") {
    throw new Error("Teamtailor-kopplingen är inte på. Sätt ATS_PROVIDER=local.");
  }
  if (value !== "local") {
    throw new Error("Okänd ATS_PROVIDER. Sätt ATS_PROVIDER=local.");
  }
}

export async function getJobSource(): Promise<JobSource> {
  assertProvider();
  return localJobSource;
}

export function parseJobQuery(
  params: Record<string, string | string[] | undefined>,
  knownLocations: string[],
): JobFilter {
  const one = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value)?.trim();
  };
  const filter: JobFilter = {};
  const role = one("roll");
  if (role && isRoleSlug(role)) filter.role = role;
  const employment = one("anstallning");
  if (employment && isEmployment(employment)) filter.employment = employment;
  const service = one("tjanst");
  if (service && isServiceSlug(service)) filter.service = service;
  const location = one("ort");
  if (location && knownLocations.includes(location)) filter.location = location;
  return filter;
}

export function jobQueryHref(filter: JobFilter): string {
  const params = new URLSearchParams();
  if (filter.role) params.set("roll", filter.role);
  if (filter.location) params.set("ort", filter.location);
  if (filter.employment) params.set("anstallning", filter.employment);
  if (filter.service) params.set("tjanst", filter.service);
  const query = params.toString();
  return query ? `/lediga-jobb?${query}` : "/lediga-jobb";
}
