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

export default function Home() {
  return (
    <div className="relative">
      <HeroSection />
      <SocialProofSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <FooterSection />
    </div>
  );
}
