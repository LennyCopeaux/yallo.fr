"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Bot, Phone, CreditCard, Link2 } from "lucide-react";
import { GeneralTab } from "@/components/admin/restaurant-tabs/general-tab";
import { AITab } from "@/components/admin/restaurant-tabs/ai-tab";
import { TelephonyTab } from "@/components/admin/restaurant-tabs/telephony-tab";
import { BillingTab } from "@/components/admin/restaurant-tabs/billing-tab";
import { HubriseTab } from "@/components/admin/restaurant-tabs/hubrise-tab";

type Restaurant = {
  id: string;
  name: string;
  address: string | null;
  phoneNumber: string;
  ownerId: string;
  status: "active" | "suspended" | "onboarding";
  isActive: boolean | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeSubscriptionStatus: string | null;
  stripePriceId: string | null;
  billingStartDate: string | null;
  vapiAssistantId: string | null;
  vapiPhoneNumberId: string | null;
  systemPrompt: string | null;
  menuContext: string | null;
  twilioPhoneNumber: string | null;
  businessHours: string | null;
  hubriseLocationId: string | null;
  hubriseAccessToken: string | null;
  hubriseCatalogId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  ownerEmail: string;
};

type Owner = {
  id: string;
  email: string;
};

interface RestaurantDetailTabsProps {
  restaurant: Restaurant;
  owners: Owner[];
}

export function RestaurantDetailTabs({ restaurant, owners }: Readonly<RestaurantDetailTabsProps>) {
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
          <span className="hidden sm:inline">Général</span>
        </TabsTrigger>
        <TabsTrigger 
          value="ai" 
          className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">IA & Menu</span>
        </TabsTrigger>
        <TabsTrigger 
          value="telephony" 
          className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
        >
          <Phone className="w-4 h-4" />
          <span className="hidden sm:inline">Téléphonie</span>
        </TabsTrigger>
        <TabsTrigger 
          value="billing" 
          className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
        >
          <CreditCard className="w-4 h-4" />
          <span className="hidden sm:inline">Facturation</span>
        </TabsTrigger>
        <TabsTrigger 
          value="hubrise" 
          className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
        >
          <Link2 className="w-4 h-4" />
          <span className="hidden sm:inline">HubRise</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <GeneralTab restaurant={restaurant} owners={owners} />
      </TabsContent>

      <TabsContent value="ai">
        <AITab restaurant={restaurant} />
      </TabsContent>

      <TabsContent value="telephony">
        <TelephonyTab restaurant={restaurant} />
      </TabsContent>

      <TabsContent value="billing">
        <BillingTab restaurant={restaurant} />
      </TabsContent>

      <TabsContent value="hubrise">
        <HubriseTab restaurant={restaurant} />
      </TabsContent>
    </Tabs>
  );
}
