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
      {/* Hero avec conversation téléphonique live */}
      <HeroSection />

      {/* Social Proof - Marquee des types de restaurants */}
      <SocialProofSection />

      {/* Comment ça marche - 3 étapes zig-zag */}
      <HowItWorksSection />

      {/* Fonctionnalités - Bento Grid */}
      <FeaturesSection />

      {/* Tarification - 2 plans */}
      <PricingSection />

      {/* FAQ - Accordion */}
      <FaqSection />

      {/* CTA Banner final */}
      <CtaSection />

      {/* Footer avec liens */}
      <FooterSection />
    </div>
  );
}
