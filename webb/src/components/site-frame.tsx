"use client";

import { usePathname } from "next/navigation";
import { AppearanceProvider } from "@/components/appearance";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function SiteFrame({
  children,
  registerReady = false,
  updatedLabel,
}: {
  children: React.ReactNode;
  registerReady?: boolean;
  updatedLabel: string | null;
}) {
  const path = usePathname();
  if (path.startsWith("/crm")) return children;
  return (
    <AppearanceProvider>
      <SiteHeader />
      {children}
      <SiteFooter updatedLabel={updatedLabel} registerReady={registerReady} />
    </AppearanceProvider>
  );
}
