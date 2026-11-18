import { t, type CopyKey } from "@/lib/content/copy";
import type { EmploymentType, LocationType, RoleSlug, ServiceSlug, Workload } from "@/lib/content/types";

function fromKey(key: CopyKey): string {
  return t(key);
}

export function roleLabel(role: RoleSlug): string {
  const labels: Record<RoleSlug, CopyKey> = {
    salj: "jobs.role.salj",
    it: "jobs.role.it",
    ekonomi: "jobs.role.ekonomi",
    annat: "jobs.role.annat",
  };
  return fromKey(labels[role]);
}

export function serviceLabel(service: ServiceSlug): string {
  const labels: Record<ServiceSlug, CopyKey> = {
    rekrytering: "jobs.service.rekrytering",
    headhunting: "jobs.service.headhunting",
    bemanning: "jobs.service.bemanning",
  };
  return fromKey(labels[service]);
}

export function employmentLabel(employment: EmploymentType): string {
  const labels: Record<EmploymentType, CopyKey> = {
    tillsvidare: "jobs.employment.tillsvidare",
    visstid: "jobs.employment.visstid",
    konsult: "jobs.employment.konsult",
  };
  return fromKey(labels[employment]);
}

export function workloadLabel(workload: Workload): string {
  const labels: Record<Workload, CopyKey> = {
    heltid: "jobs.workload.heltid",
    deltid: "jobs.workload.deltid",
  };
  return fromKey(labels[workload]);
}

export function locationTypeLabel(locationType: LocationType): string {
  const labels: Record<LocationType, CopyKey> = {
    "pa-plats": "jobs.locationType.pa-plats",
    hybrid: "jobs.locationType.hybrid",
    distans: "jobs.locationType.distans",
  };
  return fromKey(labels[locationType]);
}
