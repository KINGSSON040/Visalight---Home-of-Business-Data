import "server-only";

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";
import matter from "gray-matter";
import { load as loadYaml } from "js-yaml";
import { z } from "zod";
import {
  audiences,
  employmentTypes,
  isIsoDate,
  jobStatuses,
  locationTypes,
  roleSlugs,
  serviceSlugs,
  workloads,
  type BlogPost,
  type CaseStudy,
  type FaqItem,
  type Job,
  type PageDocument,
  type ProcessStep,
  type RoleItem,
  type ServiceItem,
  type TeamMember,
} from "@/lib/content/types";

function dataPath(...parts: string[]): string {
  return path.join(process.cwd(), "data", ...parts);
}

function invalid(message: string): null {
  if (process.env.NODE_ENV !== "production") {
    throw new Error(message);
  }
  console.error(message);
  return null;
}

const dateString = z.string().refine(isIsoDate, "Datum ska vara YYYY-MM-DD.");

const jobSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  status: z.enum(jobStatuses),
  draft: z.boolean(),
  example: z.boolean(),
  role: z.enum(roleSlugs),
  service: z.enum(serviceSlugs),
  location: z.string().min(1),
  locationType: z.enum(locationTypes),
  employment: z.enum(employmentTypes),
  workload: z.enum(workloads),
  publishedAt: dateString,
  validThrough: dateString.nullable(),
  applyBy: dateString.nullable(),
  company: z.string().min(1),
  companyPublic: z.boolean(),
  summary: z.string().min(1).max(180),
  salary: z.string().min(1).nullable(),
  seoTitle: z.string().min(1),
  seoDescription: z.string().min(1),
  body: z.string(),
});

const quoteSchema = z
  .object({
    text: z.string().optional(),
    name: z.string().optional(),
    role: z.string().optional(),
  })
  .optional();

const caseSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  draft: z.boolean(),
  client: z.string().min(1),
  clientPublic: z.boolean(),
  industry: z.string().min(1),
  roles: z.array(z.enum(roleSlugs)).min(1),
  service: z.enum(serviceSlugs),
  location: z.string().min(1),
  year: z.number().int(),
  summary: z.string().min(1),
  quote: quoteSchema,
  seoTitle: z.string().min(1),
  seoDescription: z.string().min(1),
  body: z.string(),
});

const teamSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  draft: z.boolean(),
  role: z.string().min(1),
  location: z.string().min(1),
  focus: z.array(z.enum(roleSlugs)).min(1),
  email: z.string().optional(),
  phone: z.string().optional(),
  order: z.number().int(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  body: z.string(),
});

const postSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  draft: z.boolean(),
  publishedAt: dateString,
  updatedAt: dateString.optional(),
  authorSlug: z.string().optional(),
  excerpt: z.string().min(1),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().min(1),
  seoDescription: z.string().min(1),
  body: z.string(),
});

const pageSchema = z.object({
  title: z.string().min(1),
  seoTitle: z.string().min(1),
  seoDescription: z.string().min(1),
  body: z.string(),
});

const serviceSchema = z.object({
  slug: z.enum(serviceSlugs),
  name: z.string().min(1),
  summary: z.string().min(1),
  href: z.string().startsWith("/"),
});

const roleSchema = z.object({
  slug: z.enum(["salj", "it", "ekonomi"]),
  name: z.string().min(1),
  summary: z.string().min(1),
  href: z.string().startsWith("/"),
});

const faqSchema = z.object({
  id: z.string().min(1),
  audience: z.enum(audiences),
  question: z.string().min(1),
  answer: z.string().min(1),
});

function readYamlFile(relativePath: string): unknown {
  return loadYaml(readFileSync(dataPath(relativePath), "utf8"));
}

function readMdxFile(relativePath: string): { fileSlug: string; data: Record<string, unknown>; body: string } | null {
  const absolute = dataPath(relativePath);
  if (!existsSync(absolute)) return null;
  const parsed = matter(readFileSync(absolute, "utf8"));
  const fileSlug = path.basename(relativePath).replace(/\.sv\.mdx$/, "").replace(/\.mdx$/, "");
  return {
    fileSlug,
    data: parsed.data as Record<string, unknown>,
    body: parsed.content,
  };
}

function readMdxDirectory(relativeDir: string) {
  const absolute = dataPath(relativeDir);
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => readMdxFile(path.join(relativeDir, name)))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
}

function parseRecord<T>(label: string, schema: z.ZodType<T>, value: unknown, fileSlug?: string): T | null {
  const result = schema.safeParse(value);
  if (!result.success) {
    return invalid(`${label}: ${result.error.issues.map((issue) => issue.message).join(", ")}`);
  }
  if (fileSlug && result.data && typeof result.data === "object" && "slug" in result.data) {
    const slug = (result.data as { slug?: string }).slug;
    if (slug !== fileSlug) {
      return invalid(`${label}: slug ${slug} matchar inte filnamnet ${fileSlug}`);
    }
  }
  return result.data;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export async function getServices(): Promise<ServiceItem[]> {
  "use cache";
  cacheLife("max");
  cacheTag("services");
  const parsed = z.array(serviceSchema).safeParse(readYamlFile("services.yaml"));
  if (!parsed.success) {
    invalid(`services.yaml: ${parsed.error.message}`);
    return [];
  }
  return parsed.data;
}

export async function getRoles(): Promise<RoleItem[]> {
  "use cache";
  cacheLife("max");
  cacheTag("roles");
  const parsed = z.array(roleSchema).safeParse(readYamlFile("roles.yaml"));
  if (!parsed.success) {
    invalid(`roles.yaml: ${parsed.error.message}`);
    return [];
  }
  return parsed.data;
}

export async function getProcess(variant: "arbetsgivare" | "jobbsokande"): Promise<ProcessStep[]> {
  "use cache";
  cacheLife("max");
  cacheTag("process");
  const raw = asRecord(readYamlFile("process.yaml"));
  const parsed = z
    .array(z.object({ title: z.string().min(1), text: z.string().min(1) }))
    .safeParse(raw[variant]);
  if (!parsed.success) {
    invalid(`process.yaml ${variant}: ${parsed.error.message}`);
    return [];
  }
  return parsed.data;
}

export async function getFaq(): Promise<FaqItem[]> {
  "use cache";
  cacheLife("max");
  cacheTag("faq");
  const parsed = z.array(faqSchema).safeParse(readYamlFile("faq/sv.yaml"));
  if (!parsed.success) {
    invalid(`faq/sv.yaml: ${parsed.error.message}`);
    return [];
  }
  const ids = new Set<string>();
  return parsed.data.filter((item) => {
    if (ids.has(item.id)) {
      invalid(`faq: dubblett-id ${item.id}`);
      return false;
    }
    ids.add(item.id);
    return true;
  });
}

export async function getPage(id: string): Promise<PageDocument | null> {
  "use cache";
  cacheLife("max");
  cacheTag("pages");
  const paths: Record<string, string> = {
    "om-oss": "pages/om-oss.sv.mdx",
    rekrytering: "pages/tjanster/rekrytering.sv.mdx",
    headhunting: "pages/tjanster/headhunting.sv.mdx",
    bemanning: "pages/tjanster/bemanning.sv.mdx",
    salj: "pages/roller/salj.sv.mdx",
    it: "pages/roller/it.sv.mdx",
    ekonomi: "pages/roller/ekonomi.sv.mdx",
    "for-arbetsgivare": "pages/for-arbetsgivare.sv.mdx",
    "for-jobbsokande": "pages/for-jobbsokande.sv.mdx",
  };
  const relative = paths[id];
  if (!relative) return null;
  const file = readMdxFile(relative);
  if (!file) return invalid(`Sida saknas: ${id}`);
  return parseRecord(relative, pageSchema, { ...file.data, body: file.body });
}

export async function getLegal(id: "integritetspolicy" | "cookiepolicy" | "villkor"): Promise<PageDocument | null> {
  "use cache";
  cacheLife("max");
  cacheTag("legal");
  const file = readMdxFile(`legal/${id}.sv.mdx`);
  if (!file) return invalid(`Juridisk sida saknas: ${id}`);
  return parseRecord(id, pageSchema, { ...file.data, body: file.body });
}

function asDateString(value: unknown): unknown {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, "0");
    const day = String(value.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return value;
}

function prepareJob(data: Record<string, unknown>, body: string) {
  return {
    ...data,
    draft: typeof data.draft === "boolean" ? data.draft : true,
    example: data.example === true,
    publishedAt: asDateString(data.publishedAt),
    validThrough: data.validThrough == null ? null : asDateString(data.validThrough),
    applyBy: data.applyBy == null ? null : asDateString(data.applyBy),
    salary: data.salary ?? null,
    body,
  };
}

export async function readAllJobs(): Promise<Job[]> {
  "use cache";
  cacheLife("max");
  cacheTag("jobs");
  const jobs: Job[] = [];
  for (const file of readMdxDirectory("jobs")) {
    const parsed = parseRecord(`jobs/${file.fileSlug}`, jobSchema, prepareJob(file.data, file.body), file.fileSlug);
    if (parsed) jobs.push(parsed);
  }
  return jobs.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

function completeQuote(quote: z.infer<typeof quoteSchema>): CaseStudy["quote"] {
  if (!quote?.text?.trim() || !quote.name?.trim() || !quote.role?.trim()) return null;
  return { text: quote.text.trim(), name: quote.name.trim(), role: quote.role.trim() };
}

export async function readAllCases(): Promise<CaseStudy[]> {
  "use cache";
  cacheLife("max");
  cacheTag("cases");
  const cases: CaseStudy[] = [];
  for (const file of readMdxDirectory("kundcase")) {
    const parsed = parseRecord(
      `kundcase/${file.fileSlug}`,
      caseSchema,
      { ...file.data, draft: typeof file.data.draft === "boolean" ? file.data.draft : true, body: file.body },
      file.fileSlug,
    );
    if (!parsed) continue;
    cases.push({ ...parsed, quote: completeQuote(parsed.quote) });
  }
  return cases.sort((a, b) => b.year - a.year);
}

export async function readAllTeam(): Promise<TeamMember[]> {
  "use cache";
  cacheLife("max");
  cacheTag("team");
  const people: TeamMember[] = [];
  for (const file of readMdxDirectory("team")) {
    const parsed = parseRecord(
      `team/${file.fileSlug}`,
      teamSchema,
      { ...file.data, draft: typeof file.data.draft === "boolean" ? file.data.draft : true, body: file.body },
      file.fileSlug,
    );
    if (!parsed) continue;
    const image = parsed.image?.trim() ? parsed.image.trim() : null;
    if (image && !parsed.imageAlt?.trim()) {
      invalid(`team/${file.fileSlug}: imageAlt krävs när image finns`);
      continue;
    }
    people.push({
      ...parsed,
      email: parsed.email?.trim() || null,
      phone: parsed.phone?.trim() || null,
      image,
      imageAlt: image ? parsed.imageAlt?.trim() || null : null,
    });
  }
  return people.sort((a, b) => a.order - b.order);
}

export async function readAllPosts(): Promise<BlogPost[]> {
  "use cache";
  cacheLife("max");
  cacheTag("blog");
  const posts: BlogPost[] = [];
  for (const file of readMdxDirectory("blogg")) {
    const parsed = parseRecord(
      `blogg/${file.fileSlug}`,
      postSchema,
      {
        ...file.data,
        draft: typeof file.data.draft === "boolean" ? file.data.draft : true,
        publishedAt: asDateString(file.data.publishedAt),
        updatedAt: file.data.updatedAt == null ? undefined : asDateString(file.data.updatedAt),
        body: file.body,
      },
      file.fileSlug,
    );
    if (!parsed) continue;
    posts.push({
      ...parsed,
      updatedAt: parsed.updatedAt || parsed.publishedAt,
      authorSlug: parsed.authorSlug?.trim() || null,
      tags: parsed.tags ?? [],
    });
  }
  return posts.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export async function getPublishedCases(): Promise<CaseStudy[]> {
  const cases = await readAllCases();
  return cases.filter((item) => !item.draft);
}

export async function getCaseBySlug(slug: string): Promise<CaseStudy | null> {
  const cases = await readAllCases();
  return cases.find((item) => item.slug === slug && !item.draft) ?? null;
}

export async function getPublishedTeam(): Promise<TeamMember[]> {
  const people = await readAllTeam();
  return people.filter((item) => !item.draft);
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await readAllPosts();
  return posts.filter((item) => !item.draft);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await readAllPosts();
  return posts.find((item) => item.slug === slug && !item.draft) ?? null;
}
