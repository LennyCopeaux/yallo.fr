import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function AdminOrganizationsLoading() {
  return <PageSkeleton cards={3} rows={8} />;
}
