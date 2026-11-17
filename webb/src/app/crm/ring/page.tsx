import { Suspense } from "react";
import { ColdCall } from "@/components/crm-call";

export default async function RingPage({
  searchParams,
}: {
  searchParams: Promise<{ segment?: string }>;
}) {
  const { segment } = await searchParams;
  return (
    <Suspense fallback={<p className="text-sm text-muted">Hämtar kön.</p>}>
      <ColdCall segmentId={segment ?? ""} />
    </Suspense>
  );
}
