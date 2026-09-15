import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function AdminUsersLoading() {
  return <PageSkeleton cards={2} rows={8} />;
}
