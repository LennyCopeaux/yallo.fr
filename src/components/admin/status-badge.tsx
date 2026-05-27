import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AdminStatusTone = "active" | "warning" | "danger" | "neutral";

const TONE_CLASSES: Record<AdminStatusTone, { badge: string; dot: string }> = {
  active: {
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  warning: {
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
  },
  danger: {
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    dot: "bg-red-400",
  },
  neutral: {
    badge: "bg-muted/40 text-muted-foreground border-border",
    dot: "bg-muted-foreground/70",
  },
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
  const classes = TONE_CLASSES[tone];

  return (
    <Badge
      variant="outline"
      className={cn("inline-flex items-center gap-1.5 font-medium", classes.badge, className)}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", classes.dot)} aria-hidden="true" />
      {label}
    </Badge>
  );
}
