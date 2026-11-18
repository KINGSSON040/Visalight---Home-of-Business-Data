export const serviceSlugs = ["rekrytering", "headhunting", "bemanning"] as const;
export type ServiceSlug = (typeof serviceSlugs)[number];

export const roleSlugs = ["salj", "it", "ekonomi", "annat"] as const;
export type RoleSlug = (typeof roleSlugs)[number];

export const locationTypes = ["pa-plats", "hybrid", "distans"] as const;
export type LocationType = (typeof locationTypes)[number];

export const employmentTypes = ["tillsvidare", "visstid", "konsult"] as const;
export type EmploymentType = (typeof employmentTypes)[number];

export const workloads = ["heltid", "deltid"] as const;
export type Workload = (typeof workloads)[number];

export const jobStatuses = ["open", "closed"] as const;
export type JobStatus = (typeof jobStatuses)[number];

export const audiences = ["arbetsgivare", "jobbsokande", "allmant"] as const;
export type Audience = (typeof audiences)[number];

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function isServiceSlug(value: string): value is ServiceSlug {
  return (serviceSlugs as readonly string[]).includes(value);
}

export function isRoleSlug(value: string): value is RoleSlug {
  return (roleSlugs as readonly string[]).includes(value);
}

export function isEmployment(value: string): value is EmploymentType {
  return (employmentTypes as readonly string[]).includes(value);
}

export function isIsoDate(value: string): boolean {
  if (!datePattern.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function formatSwedishDate(iso: string): string {
  const months = [
    "januari",
    "februari",
    "mars",
    "april",
    "maj",
    "juni",
    "juli",
    "augusti",
    "september",
    "oktober",
    "november",
    "december",
  ];
  const [year, month, day] = iso.split("-");
  const monthName = months[Number(month) - 1] ?? month;
  return `${Number(day)} ${monthName} ${year}`;
}

export type Job = {
  title: string;
  slug: string;
  status: JobStatus;
  draft: boolean;
  /** Example ads are labeled, excluded from search indexing, and never emitted as JobPosting. */
  example: boolean;
  role: RoleSlug;
  service: ServiceSlug;
  location: string;
  locationType: LocationType;
  employment: EmploymentType;
  workload: Workload;
  publishedAt: string;
  validThrough: string | null;
  applyBy: string | null;
  company: string;
  companyPublic: boolean;
  summary: string;
  salary: string | null;
  seoTitle: string;
  seoDescription: string;
  body: string;
};

export type JobFilter = {
  role?: RoleSlug;
  location?: string;
  employment?: EmploymentType;
  service?: ServiceSlug;
};

export type ServiceItem = {
  slug: ServiceSlug;
  name: string;
  summary: string;
  href: string;
};

export type RoleItem = {
  slug: Exclude<RoleSlug, "annat">;
  name: string;
  summary: string;
  href: string;
};

export type ProcessStep = {
  title: string;
  text: string;
};

export type PageDocument = {
  title: string;
  seoTitle: string;
  seoDescription: string;
  body: string;
};

export type FaqItem = {
  id: string;
  audience: Audience;
  question: string;
  answer: string;
};

export type Quote = {
  text: string;
  name: string;
  role: string;
};

export type CaseStudy = {
  title: string;
  slug: string;
  draft: boolean;
  client: string;
  clientPublic: boolean;
  industry: string;
  roles: RoleSlug[];
  service: ServiceSlug;
  location: string;
  year: number;
  summary: string;
  quote: Quote | null;
  seoTitle: string;
  seoDescription: string;
  body: string;
};

export type TeamMember = {
  name: string;
  slug: string;
  draft: boolean;
  role: string;
  location: string;
  focus: RoleSlug[];
  email: string | null;
  phone: string | null;
  order: number;
  image: string | null;
  imageAlt: string | null;
  body: string;
};

export type BlogPost = {
  title: string;
  slug: string;
  draft: boolean;
  publishedAt: string;
  updatedAt: string;
  authorSlug: string | null;
  excerpt: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  body: string;
};

export type StoredCv = {
  pathname: string;
  filename: string;
  contentType: string;
  bytes: Uint8Array;
};

export type JobApplicationSubmission = {
  kind: "job";
  jobSlug: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  message?: string;
  cv: StoredCv;
};

export type SpontaneousSubmission = {
  kind: "spontaneous";
  role: RoleSlug;
  location?: string;
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  message?: string;
  cv: StoredCv;
};

export type Submission = JobApplicationSubmission | SpontaneousSubmission;
