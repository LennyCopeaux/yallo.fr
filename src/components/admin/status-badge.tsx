import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AdminStatusTone = "active" | "warning" | "danger" | "neutral";

const TONE_CLASSES: Record<AdminStatusTone, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  danger: "bg-red-500/10 text-red-400 border-red-500/20",
  neutral: "bg-muted/40 text-muted-foreground border-border",
};

interface AdminStatusBadgeProps {
  label: string;
  tone?: AdminStatusTone;
  className?: string;
}

export function AdminStatusBadge({
  label,
  tone = "neutral",
  className,
}: Readonly<AdminStatusBadgeProps>) {
  return (
    <Badge
      variant="outline"
      className={cn("inline-flex items-center font-medium", TONE_CLASSES[tone], className)}
    >
      {label}
    </Badge>
  );
}

const STRIPE_LABELS: Record<string, string> = {
  active: "Actif",
  trialing: "Essai",
  past_due: "Impayé",
  unpaid: "Impayé",
  canceled: "Annulé",
  incomplete: "Incomplet",
  incomplete_expired: "Expiré",
  paused: "En pause",
};

export function stripeStatusTone(status: string): AdminStatusTone {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due" || status === "unpaid" || status === "paused") return "warning";
  if (status === "canceled" || status === "incomplete_expired") return "danger";
  return "neutral";
}

export function stripeStatusLabel(status: string): string {
  return STRIPE_LABELS[status] ?? status;
}
