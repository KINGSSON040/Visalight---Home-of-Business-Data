import { CrmFrame } from "@/components/crm-shell";
import { CrmProvider } from "@/lib/crm-store";

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <CrmProvider>
      <CrmFrame>{children}</CrmFrame>
    </CrmProvider>
  );
}
