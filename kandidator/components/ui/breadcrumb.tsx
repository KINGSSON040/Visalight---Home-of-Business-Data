import Link from "next/link";
import { cn } from "@/lib/utils";

export function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="Brödsmulor" className={cn("text-base", className)} {...props} />;
}

export function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return <ol className={cn("flex flex-wrap items-center gap-2", className)} {...props} />;
}

export function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("inline-flex items-center gap-2", className)} {...props} />;
}

export function BreadcrumbLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-accent underline underline-offset-4">
      {children}
    </Link>
  );
}

export function BreadcrumbPage({ children }: { children: React.ReactNode }) {
  return <span aria-current="page">{children}</span>;
}

export function BreadcrumbSeparator() {
  return <span aria-hidden="true">/</span>;
}
