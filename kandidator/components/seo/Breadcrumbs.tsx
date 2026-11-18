import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { t } from "@/lib/content/copy";
import type { Crumb } from "@/lib/seo/schema";

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <Breadcrumb className="pt-6" aria-label={t("a11y.breadcrumb")}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <BreadcrumbItem key={item.href}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              {last ? <BreadcrumbPage>{item.name}</BreadcrumbPage> : <BreadcrumbLink href={item.href}>{item.name}</BreadcrumbLink>}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
