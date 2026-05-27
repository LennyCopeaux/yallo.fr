"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, CreditCard } from "lucide-react";
import { OrgGeneralTab } from "@/components/admin/org-tabs/general-tab";
import { OrgBillingTab } from "@/components/admin/org-tabs/billing-tab";

export type OrgDetail = {
  id: string;
  name: string;
  ownerId: string;
  ownerEmail: string;
  isActive: boolean;
  status: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeSubscriptionStatus: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: Date | null;
  billingStartDate: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type OrgMember = { id: string; email: string; role?: string };
export type OrgRestaurant = { id: string; name: string; status: string };

interface OrgDetailTabsProps {
  org: OrgDetail;
  owners: OrgMember[];
  members: OrgMember[];
  assignedRestaurants: OrgRestaurant[];
  allRestaurants: OrgRestaurant[];
}

export function OrgDetailTabs({ org, owners, members, assignedRestaurants, allRestaurants }: Readonly<OrgDetailTabsProps>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const urlTab = searchParams.get("tab") || "general";
  const [activeTab, setActiveTab] = useState(urlTab);

  useEffect(() => {
    setActiveTab(urlTab);
  }, [urlTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
      <TabsList className="bg-card/30 border border-border p-1 w-full justify-start overflow-x-auto">
        <TabsTrigger
          value="general"
          className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Informations générales</span>
        </TabsTrigger>
        <TabsTrigger
          value="billing"
          className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
        >
          <CreditCard className="w-4 h-4" />
          <span className="hidden sm:inline">Facturation</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <OrgGeneralTab org={org} owners={owners} members={members} assignedRestaurants={assignedRestaurants} allRestaurants={allRestaurants} />
      </TabsContent>

      <TabsContent value="billing">
        <OrgBillingTab org={org} />
      </TabsContent>
    </Tabs>
  );
}
