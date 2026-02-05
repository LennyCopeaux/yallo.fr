import {
  HeroSection,
  SocialProofSection,
  HowItWorksSection,
  FeaturesSection,
  PricingSection,
  FaqSection,
  CtaSection,
  FooterSection,
} from "@/components/landing";
import { getPricingPlans } from "@/app/(admin)/admin/settings/actions";

export default async function Home() {
  const pricingPlans = await getPricingPlans();

  return (
    <div className="relative">
      <HeroSection />
      <SocialProofSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection pricingPlans={pricingPlans} />
      <FaqSection />
      <CtaSection />
      <FooterSection />
    </div>
  );
}
