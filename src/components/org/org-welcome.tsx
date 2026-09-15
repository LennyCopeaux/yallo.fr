"use client";

import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AdminStatusBadge } from "@/components/admin/status-badge";

type Organization = {
  id: string;
  name: string;
  isActive: boolean;
  stripeSubscriptionStatus: string | null;
};

type Restaurant = {
  id: string;
  name: string;
  status: string;
  organizationId: string | null;
};

interface OrgWelcomeProps {
  user: { firstName: string | null; email: string };
  organizations: Organization[];
  restaurants: Restaurant[];
}

export function OrgWelcome({ user, organizations, restaurants }: Readonly<OrgWelcomeProps>) {
  const greeting = user.firstName ? `Bonjour, ${user.firstName}` : "Bonjour";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8">
        {}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <Building2 className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{greeting} 👋</h1>
          <p className="text-muted-foreground">Sélectionnez votre organisation</p>
        </div>

        {}
        <div className="space-y-3">
          {organizations.map((org) => {
            const orgRestaurants = restaurants.filter((r) => r.organizationId === org.id);
            return (
              <Link key={org.id} href={`/org/${org.id}`} prefetch className="block">
                <Card className="p-4 hover:border-primary/50 transition-all hover:bg-card/80 group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">{org.name}</p>
                        <AdminStatusBadge
                          tone={org.isActive ? "active" : "neutral"}
                          label={org.isActive ? "Active" : "Inactive"}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {orgRestaurants.length} restaurant{orgRestaurants.length > 1 ? "s" : ""}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
