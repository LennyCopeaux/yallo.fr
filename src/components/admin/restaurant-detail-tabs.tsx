"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Bot, Phone, CreditCard } from "lucide-react";
import { GeneralTab } from "@/components/admin/restaurant-tabs/general-tab";
import { AITab } from "@/components/admin/restaurant-tabs/ai-tab";
import { TelephonyTab } from "@/components/admin/restaurant-tabs/telephony-tab";
import { BillingTab } from "@/components/admin/restaurant-tabs/billing-tab";

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phoneNumber: string;
  ownerId: string;
  status: "active" | "suspended" | "onboarding";
  isActive: boolean | null;
  stripeCustomerId: string | null;
  billingStartDate: string | null;
  vapiAssistantId: string | null;
  systemPrompt: string | null;
  menuContext: string | null;
  twilioPhoneNumber: string | null;
  forwardingPhoneNumber: string | null;
  businessHours: string | null;
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

export function RestaurantDetailTabs({ restaurant, owners }: RestaurantDetailTabsProps) {
  return (
    <Tabs defaultValue="general" className="space-y-6">
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
    </Tabs>
  );
}
