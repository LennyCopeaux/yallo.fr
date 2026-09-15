import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function OrdersLoading() {
  return <PageSkeleton cards={0} rows={6} />;
}
