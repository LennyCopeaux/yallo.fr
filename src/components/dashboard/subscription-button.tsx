"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createStripeCheckoutSessionForRestaurant } from "@/features/billing/actions";

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

interface SubscriptionButtonProps {
  subscriptionStatus: string | null;
}

export function SubscriptionButton({ subscriptionStatus }: Readonly<SubscriptionButtonProps>) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isActive = subscriptionStatus ? ACTIVE_STATUSES.has(subscriptionStatus) : false;

  const handleSubscribe = () => {
    startTransition(async () => {
      const result = await createStripeCheckoutSessionForRestaurant();
      if (!result.success || !result.data?.checkoutUrl) {
        toast.error(result.error ?? "Impossible d'ouvrir Stripe Checkout.");
        return;
      }
      router.push(result.data.checkoutUrl);
    });
  };

  if (isActive) {
    return (
      <Badge className="gap-2 px-4 py-2 text-sm bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
        <CheckCircle className="h-4 w-4" />
        Abonnement actif
      </Badge>
    );
  }

  if (subscriptionStatus && !isActive) {
    return (
      <div className="flex flex-col items-end gap-2">
        <Badge className="gap-2 px-3 py-1 text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
          <AlertCircle className="h-3 w-3" />
          {subscriptionStatus}
        </Badge>
        <Button onClick={handleSubscribe} disabled={isPending} className="gap-2">
          <CreditCard className="h-4 w-4" />
          {isPending ? "Redirection..." : "Régulariser l'abonnement"}
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleSubscribe} disabled={isPending} className="gap-2">
      <CreditCard className="h-4 w-4" />
      {isPending ? "Redirection..." : "Activer l'abonnement"}
    </Button>
  );
}
