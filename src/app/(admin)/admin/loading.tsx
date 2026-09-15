import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function AdminLoading() {
  return <PageSkeleton cards={4} rows={8} />;
}
