import { MarketingNavbar } from "@/components/landing/marketing-navbar";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <MarketingNavbar />

      <main className="relative">
        {children}
      </main>
    </div>
  );
}
