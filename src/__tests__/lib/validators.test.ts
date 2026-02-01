import { describe, it, expect } from "vitest";
import { z } from "zod";

// Schémas de validation utilisés dans l'application
const userLoginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

const restaurantSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100, "Le nom est trop long"),
  slug: z.string()
    .min(1, "Le slug est requis")
    .regex(/^[a-z0-9-]+$/, "Le slug ne doit contenir que des lettres minuscules, chiffres et tirets"),
  phoneNumber: z.string()
    .min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres")
    .regex(/^[+]?[0-9\s-]+$/, "Format de téléphone invalide"),
  address: z.string().optional(),
});

const hubriseConfigSchema = z.object({
  hubriseLocationId: z.string().min(1, "Location ID requis"),
  hubriseAccessToken: z.string().min(1, "Access Token requis"),
});

const orderItemSchema = z.object({
  productName: z.string().min(1, "Nom du produit requis"),
  quantity: z.number().int().min(1, "Quantité minimale: 1"),
  unitPrice: z.number().int().min(0, "Prix invalide"),
});

const businessHoursSchema = z.object({
  monday: z.object({
    open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:MM requis"),
    close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:MM requis"),
    isClosed: z.boolean(),
  }),
});

// Helper pour extraire le premier message d'erreur (compatible Zod v4)
function getFirstErrorMessage(result: z.SafeParseReturnType<unknown, unknown>): string | undefined {
  if (result.success) return undefined;
  const issues = result.error.issues || result.error.errors || [];
  return issues[0]?.message;
}

describe("userLoginSchema", () => {
  it("devrait valider un email et mot de passe corrects", () => {
    const data = { email: "test@example.com", password: "password123" };
    const result = userLoginSchema.safeParse(data);
    
    expect(result.success).toBe(true);
  });

  it("devrait rejeter un email invalide", () => {
    const data = { email: "invalid-email", password: "password123" };
    const result = userLoginSchema.safeParse(data);
    
    expect(result.success).toBe(false);
    expect(getFirstErrorMessage(result)).toBeDefined();
  });

  it("devrait rejeter un mot de passe trop court", () => {
    const data = { email: "test@example.com", password: "123" };
    const result = userLoginSchema.safeParse(data);
    
    expect(result.success).toBe(false);
    expect(getFirstErrorMessage(result)).toBeDefined();
  });

  it("devrait rejeter si email manquant", () => {
    const data = { password: "password123" };
    const result = userLoginSchema.safeParse(data);
    
    expect(result.success).toBe(false);
  });
});

describe("restaurantSchema", () => {
  it("devrait valider un restaurant complet", () => {
    const data = {
      name: "Kebab La Medina",
      slug: "kebab-la-medina",
      phoneNumber: "+33 1 23 45 67 89",
      address: "123 Rue de Paris",
    };
    const result = restaurantSchema.safeParse(data);
    
    expect(result.success).toBe(true);
  });

  it("devrait valider sans adresse (optionnelle)", () => {
    const data = {
      name: "Kebab La Medina",
      slug: "kebab-la-medina",
      phoneNumber: "0123456789",
    };
    const result = restaurantSchema.safeParse(data);
    
    expect(result.success).toBe(true);
  });

  it("devrait rejeter un slug avec majuscules", () => {
    const data = {
      name: "Kebab La Medina",
      slug: "Kebab-La-Medina",
      phoneNumber: "0123456789",
    };
    const result = restaurantSchema.safeParse(data);
    
    expect(result.success).toBe(false);
    expect(getFirstErrorMessage(result)).toBeDefined();
  });

  it("devrait rejeter un slug avec espaces", () => {
    const data = {
      name: "Kebab La Medina",
      slug: "kebab la medina",
      phoneNumber: "0123456789",
    };
    const result = restaurantSchema.safeParse(data);
    
    expect(result.success).toBe(false);
  });

  it("devrait rejeter un nom vide", () => {
    const data = {
      name: "",
      slug: "kebab-la-medina",
      phoneNumber: "0123456789",
    };
    const result = restaurantSchema.safeParse(data);
    
    expect(result.success).toBe(false);
    expect(getFirstErrorMessage(result)).toBeDefined();
  });

  it("devrait rejeter un numéro de téléphone invalide", () => {
    const data = {
      name: "Kebab La Medina",
      slug: "kebab-la-medina",
      phoneNumber: "abc",
    };
    const result = restaurantSchema.safeParse(data);
    
    expect(result.success).toBe(false);
  });
});

describe("hubriseConfigSchema", () => {
  it("devrait valider une configuration HubRise complète", () => {
    const data = {
      hubriseLocationId: "19mjb-0",
      hubriseAccessToken: "valid-access-token-123",
    };
    const result = hubriseConfigSchema.safeParse(data);
    
    expect(result.success).toBe(true);
  });

  it("devrait rejeter si locationId vide", () => {
    const data = {
      hubriseLocationId: "",
      hubriseAccessToken: "valid-token",
    };
    const result = hubriseConfigSchema.safeParse(data);
    
    expect(result.success).toBe(false);
    expect(getFirstErrorMessage(result)).toBeDefined();
  });

  it("devrait rejeter si accessToken vide", () => {
    const data = {
      hubriseLocationId: "19mjb-0",
      hubriseAccessToken: "",
    };
    const result = hubriseConfigSchema.safeParse(data);
    
    expect(result.success).toBe(false);
    expect(getFirstErrorMessage(result)).toBeDefined();
  });
});

describe("orderItemSchema", () => {
  it("devrait valider un item de commande correct", () => {
    const data = {
      productName: "Kebab 2 Viandes",
      quantity: 2,
      unitPrice: 850,
    };
    const result = orderItemSchema.safeParse(data);
    
    expect(result.success).toBe(true);
  });

  it("devrait rejeter une quantité de 0", () => {
    const data = {
      productName: "Kebab 2 Viandes",
      quantity: 0,
      unitPrice: 850,
    };
    const result = orderItemSchema.safeParse(data);
    
    expect(result.success).toBe(false);
    expect(getFirstErrorMessage(result)).toBeDefined();
  });

  it("devrait rejeter une quantité négative", () => {
    const data = {
      productName: "Kebab 2 Viandes",
      quantity: -1,
      unitPrice: 850,
    };
    const result = orderItemSchema.safeParse(data);
    
    expect(result.success).toBe(false);
  });

  it("devrait rejeter un prix négatif", () => {
    const data = {
      productName: "Kebab 2 Viandes",
      quantity: 1,
      unitPrice: -100,
    };
    const result = orderItemSchema.safeParse(data);
    
    expect(result.success).toBe(false);
  });

  it("devrait rejeter un nom de produit vide", () => {
    const data = {
      productName: "",
      quantity: 1,
      unitPrice: 850,
    };
    const result = orderItemSchema.safeParse(data);
    
    expect(result.success).toBe(false);
  });
});

describe("businessHoursSchema", () => {
  it("devrait valider des horaires corrects", () => {
    const data = {
      monday: {
        open: "11:00",
        close: "22:30",
        isClosed: false,
      },
    };
    const result = businessHoursSchema.safeParse(data);
    
    expect(result.success).toBe(true);
  });

  it("devrait valider un jour fermé", () => {
    const data = {
      monday: {
        open: "00:00",
        close: "00:00",
        isClosed: true,
      },
    };
    const result = businessHoursSchema.safeParse(data);
    
    expect(result.success).toBe(true);
  });

  it("devrait rejeter un format d'heure invalide", () => {
    const data = {
      monday: {
        open: "11h00",
        close: "22:30",
        isClosed: false,
      },
    };
    const result = businessHoursSchema.safeParse(data);
    
    expect(result.success).toBe(false);
    expect(getFirstErrorMessage(result)).toBeDefined();
  });

  it("devrait rejeter une heure hors limites", () => {
    const data = {
      monday: {
        open: "25:00",
        close: "22:30",
        isClosed: false,
      },
    };
    const result = businessHoursSchema.safeParse(data);
    
    expect(result.success).toBe(false);
  });
});
