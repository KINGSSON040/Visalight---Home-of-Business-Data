import { isRoleSlug, isServiceSlug, type RoleSlug, type ServiceSlug } from "@/lib/content/types";
import { EmployerForm } from "@/components/forms/EmployerForm";

export async function EmployerFormSection({
  searchParams,
  heading,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  heading: string;
}) {
  const params = await searchParams;
  const serviceRaw = Array.isArray(params.tjanst) ? params.tjanst[0] : params.tjanst;
  const roleRaw = Array.isArray(params.roll) ? params.roll[0] : params.roll;
  const defaultService: ServiceSlug | undefined = serviceRaw && isServiceSlug(serviceRaw) ? serviceRaw : undefined;
  const defaultRole: RoleSlug | undefined = roleRaw && isRoleSlug(roleRaw) ? roleRaw : undefined;
  return (
    <section className="py-10">
      <h2 className="mb-6 text-3xl">{heading}</h2>
      <EmployerForm defaultService={defaultService} defaultRole={defaultRole} />
    </section>
  );
}
