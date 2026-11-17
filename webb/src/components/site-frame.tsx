"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function SiteFrame({
  children,
  registerReady,
}: {
  children: React.ReactNode;
  registerReady: boolean;
}) {
  const path = usePathname();
  if (path.startsWith("/crm")) return children;
  return (
    <>
      <SiteHeader registerReady={registerReady} />
      {children}
      <SiteFooter />
    </>
  );
}
