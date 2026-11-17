"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AppearanceProvider } from "@/components/appearance";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function SiteFrame({
  children,
  registerReady = false,
  updatedLabel,
  exampleData = false,
}: {
  children: React.ReactNode;
  registerReady?: boolean;
  updatedLabel: string | null;
  exampleData?: boolean;
}) {
  const path = usePathname();
  if (path.startsWith("/crm")) return <CrmFrame>{children}</CrmFrame>;
  return (
    <AppearanceProvider>
      <SiteHeader />
      {children}
      <SiteFooter updatedLabel={updatedLabel} registerReady={registerReady} exampleData={exampleData} />
    </AppearanceProvider>
  );
}

function CrmFrame({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    delete document.documentElement.dataset.theme;
  }, []);
  return children;
}
