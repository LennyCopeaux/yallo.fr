export const SUBSCRIPTION_PLANS = [
  {
    id: "starter",
    name: "Starter",
    description: "Pour tester l'IA sans risque",
    monthlyPrice: 29,
    amountCents: 2900,
    commission: "7%",
    minutes: "À la commission",
    popular: false,
    features: [
      "IA Vocale 24/7",
      "Dashboard Tablette",
      "Menu illimité",
      "Support Email",
    ],
  },
  {
    id: "essential",
    name: "Essential",
    description: "Pour les restaurants en croissance",
    monthlyPrice: 149,
    amountCents: 14900,
    commission: null,
    minutes: "400 min incluses",
    popular: true,
    features: [
      "IA Vocale 24/7",
      "Dashboard Tablette",
      "Menu illimité",
      "Support Email",
      "Connexion Logiciel de Caisse",
    ],
  },
  {
    id: "infinity",
    name: "Infinity",
    description: "Pour les gros volumes d'appels",
    monthlyPrice: 349,
    amountCents: 34900,
    commission: null,
    minutes: "1200 min incluses",
    popular: false,
    features: [
      "IA Vocale 24/7",
      "Dashboard Tablette",
      "Menu illimité",
      "Support Prioritaire",
      "Connexion Logiciel de Caisse",
    ],
  },
] as const;

export type PlanId = (typeof SUBSCRIPTION_PLANS)[number]["id"];
