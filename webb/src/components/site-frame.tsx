"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
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
    <div className="customer-site">
      <div className="aurora" aria-hidden="true">
        <span className="aurora-band a" />
        <span className="aurora-band b" />
        <span className="aurora-band c" />
      </div>
      <SiteHeader />
      {children}
      <SiteFooter updatedLabel={updatedLabel} registerReady={registerReady} exampleData={exampleData} />
    </div>
  );
}

function CrmFrame({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    delete document.documentElement.dataset.theme;
  }, []);
  return children;
}
