import { pgTable, text, timestamp, uuid, boolean, integer, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enum pour les rôles utilisateur
export const userRoleEnum = ["ADMIN", "OWNER"] as const;
export type UserRole = (typeof userRoleEnum)[number];

// Enum pour les statuts de commande
export const orderStatusEnum = ["NEW", "PREPARING", "READY", "DELIVERED", "CANCELLED"] as const;
export type OrderStatus = (typeof orderStatusEnum)[number];

// Enum pour le statut du restaurant
export const restaurantStatusEnum = ["active", "suspended", "onboarding"] as const;
export type RestaurantStatus = (typeof restaurantStatusEnum)[number];
export const restaurantStatusPgEnum = pgEnum("restaurant_status", restaurantStatusEnum);

// Enum pour le plan de facturation
export const restaurantPlanEnum = ["fixed", "commission"] as const;
export type RestaurantPlan = (typeof restaurantPlanEnum)[number];
export const restaurantPlanPgEnum = pgEnum("restaurant_plan", restaurantPlanEnum);

// Table Users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: userRoleEnum }).default("OWNER").notNull(),
  mustChangePassword: boolean("must_change_password").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Table Restaurants - CRM complet
export const restaurants = pgTable("restaurants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  address: text("address"), // Adresse physique du restaurant
  phoneNumber: text("phone_number").notNull(), // Numéro de contact principal
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Statut du compte
  status: restaurantStatusPgEnum("status").default("onboarding").notNull(),
  isActive: boolean("is_active").default(true).notNull(), // Legacy - kept for compatibility
  
  // Facturation
  plan: restaurantPlanPgEnum("plan").default("commission"),
  commissionRate: integer("commission_rate").default(5), // Pourcentage (ex: 5 = 5%)
  stripeCustomerId: text("stripe_customer_id"),
  
  // Intégration Voice AI (Vapi)
  vapiAssistantId: text("vapi_assistant_id"),
  systemPrompt: text("system_prompt"), // Surcharge du prompt système spécifique
  menuContext: text("menu_context"), // Menu brut/JSON pour l'IA
  
  // Téléphonie (Twilio)
  twilioPhoneNumber: text("twilio_phone_number"), // Numéro +33 acheté
  forwardingPhoneNumber: text("forwarding_phone_number"), // Numéro de secours du patron
  businessHours: text("business_hours"), // Horaires en JSON
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [users.id],
    references: [restaurants.ownerId],
  }),
}));

export const restaurantsRelations = relations(restaurants, ({ one, many }) => ({
  owner: one(users, {
    fields: [restaurants.ownerId],
    references: [users.id],
  }),
  categories: many(categories),
  ingredients: many(ingredients),
  ingredientCategories: many(ingredientCategories),
  orders: many(orders),
}));

// ============================================
// MENU TABLES - APPROCHE INGRÉDIENT-FIRST
// ============================================

// Table Ingredient Categories - Catégories d'ingrédients personnalisées par restaurant
export const ingredientCategories = pgTable("ingredient_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // Ex: "Viandes", "Sauces", "Suppléments", "Boissons", "Pains"
  rank: integer("rank").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Table Ingredients - Table centrale pour tous les composants
export const ingredients = pgTable("ingredients", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  ingredientCategoryId: uuid("ingredient_category_id")
    .notNull()
    .references(() => ingredientCategories.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  price: integer("price").default(0).notNull(), // Prix par défaut en centimes
  isAvailable: boolean("is_available").default(true).notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Table Categories
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  rank: integer("rank").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Table Product Variations - Variations directement dans les catégories (plus de niveau produit)
export const productVariations = pgTable("product_variations", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // Ex: "1 Viande", "2 Viandes", "Taille M", "Taille L"
  price: integer("price").notNull(), // Prix de base en centimes
  createdAt: timestamp("created_at").defaultNow(),
});

// Table Modifier Groups - Groupes d'options liés à une variation
// Maintenant référence une catégorie d'ingrédients au lieu d'un nom libre
export const modifierGroups = pgTable("modifier_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  variationId: uuid("variation_id")
    .notNull()
    .references(() => productVariations.id, { onDelete: "cascade" }),
  ingredientCategoryId: uuid("ingredient_category_id")
    .notNull()
    .references(() => ingredientCategories.id, { onDelete: "restrict" }),
  minSelect: integer("min_select").default(0).notNull(),
  maxSelect: integer("max_select").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Table Modifiers - Lien entre groupe d'options et ingrédient avec prix supplémentaire
export const modifiers = pgTable("modifiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => modifierGroups.id, { onDelete: "cascade" }),
  ingredientId: uuid("ingredient_id")
    .notNull()
    .references(() => ingredients.id, { onDelete: "cascade" }),
  priceExtra: integer("price_extra").default(0).notNull(), // Supplément en centimes
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// ORDERS TABLES - COMMANDES
// ============================================

// Table Orders - Commandes
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  orderNumber: text("order_number").notNull(), // Ex: "#2847"
  customerName: text("customer_name"), // Nom du client (optionnel)
  customerPhone: text("customer_phone"), // Téléphone du client
  status: text("status", { enum: orderStatusEnum }).default("NEW").notNull(),
  totalAmount: integer("total_amount").default(0).notNull(), // Total en centimes
  pickupTime: timestamp("pickup_time"), // Heure de retrait prévue
  notes: text("notes"), // Notes spéciales
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Table Order Items - Lignes de commande
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productName: text("product_name").notNull(), // Nom du produit (snapshot)
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: integer("unit_price").notNull(), // Prix unitaire en centimes
  totalPrice: integer("total_price").notNull(), // Prix total de la ligne en centimes
  options: text("options"), // Options choisies (JSON ou texte) ex: "Sauce blanche, Sans oignon"
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const ingredientCategoriesRelations = relations(ingredientCategories, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [ingredientCategories.restaurantId],
    references: [restaurants.id],
  }),
  ingredients: many(ingredients),
  modifierGroups: many(modifierGroups),
}));

export const ingredientsRelations = relations(ingredients, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [ingredients.restaurantId],
    references: [restaurants.id],
  }),
  ingredientCategory: one(ingredientCategories, {
    fields: [ingredients.ingredientCategoryId],
    references: [ingredientCategories.id],
  }),
  modifiers: many(modifiers),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [categories.restaurantId],
    references: [restaurants.id],
  }),
  variations: many(productVariations),
}));

export const productVariationsRelations = relations(productVariations, ({ one, many }) => ({
  category: one(categories, {
    fields: [productVariations.categoryId],
    references: [categories.id],
  }),
  modifierGroups: many(modifierGroups),
}));

export const modifierGroupsRelations = relations(modifierGroups, ({ one, many }) => ({
  variation: one(productVariations, {
    fields: [modifierGroups.variationId],
    references: [productVariations.id],
  }),
  ingredientCategory: one(ingredientCategories, {
    fields: [modifierGroups.ingredientCategoryId],
    references: [ingredientCategories.id],
  }),
  modifiers: many(modifiers),
}));

export const modifiersRelations = relations(modifiers, ({ one }) => ({
  group: one(modifierGroups, {
    fields: [modifiers.groupId],
    references: [modifierGroups.id],
  }),
  ingredient: one(ingredients, {
    fields: [modifiers.ingredientId],
    references: [ingredients.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [orders.restaurantId],
    references: [restaurants.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

// Types exportés
export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SelectRestaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = typeof restaurants.$inferInsert;
export type SelectIngredientCategory = typeof ingredientCategories.$inferSelect;
export type InsertIngredientCategory = typeof ingredientCategories.$inferInsert;
export type SelectIngredient = typeof ingredients.$inferSelect;
export type InsertIngredient = typeof ingredients.$inferInsert;
export type SelectCategory = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export type SelectProductVariation = typeof productVariations.$inferSelect;
export type InsertProductVariation = typeof productVariations.$inferInsert;
export type SelectModifierGroup = typeof modifierGroups.$inferSelect;
export type InsertModifierGroup = typeof modifierGroups.$inferInsert;
export type SelectModifier = typeof modifiers.$inferSelect;
export type InsertModifier = typeof modifiers.$inferInsert;
export type SelectOrder = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type SelectOrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;
