import { getAppUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { getBusinessHours } from "@/features/hours/actions";
import { HoursEditor } from "@/components/hours/hours-editor";

export default async function HoursPage() {
  const user = await getAppUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  const hoursData = await getBusinessHours();

  if (!hoursData.success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">{hoursData.error || "Erreur lors du chargement"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Horaires d&apos;ouverture</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Configurez les horaires d&apos;ouverture de votre restaurant
              </p>
            </div>
          </div>
        </div>

        <HoursEditor initialHours={hoursData.data as { schedule: Record<string, { open: string; close: string } | { lunch: { open: string; close: string }; dinner: { open: string; close: string } }> }} />
    </div>
  );
}

