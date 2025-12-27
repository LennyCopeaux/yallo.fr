import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthSessionProvider } from "@/components/session-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
    "Standard téléphonique automatique pour restaurant. Notre IA Kebab gère la prise de commande 24/7 pour votre Kebab, Tacos, Pizzeria ou Sushi. Zéro attente, zéro commande perdue.",
  icons: {
    icon: [
      { url: "/logo.png", sizes: "any" },
      { url: "/icon.png", sizes: "any" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  keywords: [
    "IA Kebab",
    "IA restaurant",
    "standard automatique restaurant",
    "prise de commande téléphone",
    "commande vocale restaurant",
    "assistant vocal restaurant",
    "IA tacos",
    "IA pizzeria",
    "IA sushi",
    "standard téléphonique automatique",
    "chatbot restaurant",
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
      "Standard téléphonique automatique pour Kebab, Tacos, Pizzeria et Sushi. Notre IA gère vos commandes 24/7. Zéro attente, zéro commande perdue.",
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

// JSON-LD Schema for SoftwareApplication
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Yallo",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Assistant vocal IA pour la prise de commande téléphonique dans la restauration rapide (Kebab, Tacos, Pizzeria, Sushi).",
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
    "Compatible Kebab, Tacos, Pizzeria, Sushi",
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
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="yallo-theme"
        >
          <AuthSessionProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
