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
import { getPricingConfig } from "@/app/(admin)/admin/settings/actions";

export default async function Home() {
  const pricingConfig = await getPricingConfig();

  return (
    <div className="relative">
      <HeroSection />
      <SocialProofSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection pricingConfig={pricingConfig} />
      <FaqSection />
      <CtaSection />
      <FooterSection />
    </div>
  );
}
