import { PageSkeleton } from "@/components/ui/page-skeleton";

export default function AdminRestaurantsLoading() {
  return <PageSkeleton cards={3} rows={8} />;
}
