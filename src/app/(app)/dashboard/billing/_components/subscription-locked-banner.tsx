import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";
import type { SubscriptionAccess } from "@/lib/services/subscription";
import { describeSubscriptionBlock } from "@/lib/services/subscription";

interface SubscriptionLockedBannerProps {
  access: SubscriptionAccess;
  canSubscribe: boolean;
}

export function SubscriptionLockedBanner({
  access,
  canSubscribe,
}: Readonly<SubscriptionLockedBannerProps>) {
  const { title, description } = describeSubscriptionBlock(access);

  return (
    <Card className="bg-amber-500/10 border-amber-500/30 mb-8">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-amber-500">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
            {canSubscribe ? (
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Tableau de bord et suivi des commandes</li>
                <li>Menu, horaires et paramètres de l&apos;assistant</li>
                <li>Prise de commande téléphonique par l&apos;IA</li>
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Votre compte employé ne permet pas de gérer l&apos;abonnement. Demandez au
                gérant du restaurant de le réactiver.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
