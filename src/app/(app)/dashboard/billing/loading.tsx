import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function BillingLoading() {
  return <PageSkeleton cards={3} rows={4} />;
}
