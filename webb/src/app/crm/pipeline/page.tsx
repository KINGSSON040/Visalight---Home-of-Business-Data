import type { Metadata } from "next";
import { PipelineView } from "@/components/crm-pipeline";

export const metadata: Metadata = {
  title: "Pipeline — VisaLight CRM",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PipelineView />;
}
