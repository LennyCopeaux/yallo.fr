import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const aeonik = localFont({
  src: [
    {
      path: "../lib/fonts/fonnts.com-Aeonik-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../lib/fonts/fonnts.com-Aeonik-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-aeonik",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yallo.fr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Yallo - L'IA qui prend vos commandes par téléphone",
    template: "%s | Yallo - Assistant Vocal Restaurant",
  },
  description:
    "Standard téléphonique automatique pour restaurant. Notre IA gère la prise de commande 24/7 pour votre fast food. Zéro attente, zéro commande perdue.",
  icons: {
    icon: [
      { url: "/logo.png", sizes: "any" },
      { url: "/icon.png", sizes: "any" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  keywords: [
    "IA restaurant",
    "standard automatique restaurant",
    "prise de commande téléphone",
    "commande vocale restaurant",
    "assistant vocal restaurant",
    "IA fast food",
    "IA pizzeria",
    "IA restauration rapide",
    "standard téléphonique automatique",
    "automatisation commande",
  ],
  authors: [{ name: "Yallo" }],
  creator: "Yallo",
  publisher: "Yallo",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "Yallo",
    title: "Yallo - L'IA qui prend vos commandes par téléphone",
    description:
      "Standard téléphonique automatique pour la restauration rapide. Notre IA gère vos commandes 24/7. Zéro attente, zéro commande perdue.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Yallo - Assistant Vocal IA pour Restaurant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yallo - L'IA qui prend vos commandes par téléphone",
    description:
      "Standard téléphonique automatique pour restaurant. Zéro attente, zéro commande perdue.",
    images: ["/og-image.png"],
    creator: "@yallo_fr",
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "technology",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Yallo",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Assistant vocal IA pour la prise de commande téléphonique dans la restauration rapide.",
  url: siteUrl,
  author: {
    "@type": "Organization",
    name: "Yallo",
    url: siteUrl,
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
    description: "Démonstration gratuite disponible",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "47",
    bestRating: "5",
    worstRating: "1",
  },
  featureList: [
    "Prise de commande vocale 24/7",
    "Intégration standard téléphonique",
    "Compatible avec tous les types de restaurants",
    "Zéro latence",
    "Français natif",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${aeonik.variable} ${geistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Aller au contenu principal
        </a>
        <AuthSessionProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
