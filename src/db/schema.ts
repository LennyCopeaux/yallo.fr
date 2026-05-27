import { pgTable, text, timestamp, uuid, boolean, integer, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

export const userRoleEnum = ["ADMIN", "OWNER", "EMPLOYEE"] as const;
export type UserRole = (typeof userRoleEnum)[number];

export const orderStatusEnum = ["NEW", "PREPARING", "READY", "DELIVERED", "CANCELLED"] as const;
export type OrderStatus = (typeof orderStatusEnum)[number];

export const restaurantStatusEnum = ["active", "suspended", "onboarding"] as const;
export type RestaurantStatus = (typeof restaurantStatusEnum)[number];
export const restaurantStatusPgEnum = pgEnum("restaurant_status", restaurantStatusEnum);

export const restaurantPlanEnum = ["fixed", "commission"] as const;
export type RestaurantPlan = (typeof restaurantPlanEnum)[number];
export const restaurantPlanPgEnum = pgEnum("restaurant_plan", restaurantPlanEnum);

export const kitchenStatusEnum = ["CALM", "NORMAL", "RUSH", "STOP"] as const;
export type KitchenStatus = (typeof kitchenStatusEnum)[number];
export const kitchenStatusPgEnum = pgEnum("kitchen_status", kitchenStatusEnum);

// Type pour la structure JSON du menu (compatible HubRise/Vapi)
export type MenuSku = {
  ref: string;
  name: string;
  price: string;
};

export type MenuProduct = {
  name: string;
  description?: string;
  skus: MenuSku[];
  option_list_refs?: string[];
};

export type MenuCategory = {
  name: string;
  products: MenuProduct[];
};

export type MenuOption = {
  ref: string;
  name: string;
  price?: string;
};

export type MenuOptionList = {
  ref: string;
  name: string;
  min?: number;
  max?: number;
  options: MenuOption[];
};

export type MenuData = {
  categories: MenuCategory[];
  option_lists: MenuOptionList[];
};

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** FK vers auth.users.id (Supabase Auth) */
  authUserId: text("auth_user_id").unique(),
  email: text("email").unique().notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role", { enum: userRoleEnum }).default("OWNER").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * Une organisation regroupe un ou plusieurs restaurants sous un même contrat.
 * C'est à ce niveau que l'abonnement Stripe est attaché.
 * 1 utilisateur (OWNER) = 1 organisation.
 */
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Abonnement Stripe attaché à l'organisation
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeSubscriptionStatus: text("stripe_subscription_status"),
  stripePriceId: text("stripe_price_id"),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end"),
  billingStartDate: text("billing_start_date"),
  status: text("status").notNull().default("active"),
  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SelectOrganization = InferSelectModel<typeof organizations>;

export const restaurants = pgTable("restaurants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address"),
  phoneNumber: text("phone_number").notNull(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  /** Organisation à laquelle appartient ce restaurant */
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "set null" }),
  
  status: restaurantStatusPgEnum("status").default("onboarding").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  
  plan: restaurantPlanPgEnum("plan").default("commission"),
  commissionRate: integer("commission_rate").default(5),
  
  vapiAssistantId: text("vapi_assistant_id"),
  vapiPhoneNumberId: text("vapi_phone_number_id"),  systemPrompt: text("system_prompt"),
  menuContext: text("menu_context"),
  
  // Nouveau champ: stockage document-oriented du menu complet
  menuData: jsonb("menu_data").$type<MenuData>(),
  
  twilioPhoneNumber: text("twilio_phone_number"),
  
  /** Numéro de téléphone du restaurateur vers lequel rediriger l'appel si demandé. */
  forwardingPhoneNumber: text("forwarding_phone_number"),
  /** Si true, l'agent peut transférer l'appel vers forwardingPhoneNumber sur demande du client. */
  callForwardingEnabled: boolean("call_forwarding_enabled").default(false).notNull(),
  
  businessHours: text("business_hours"),
  
  hubriseLocationId: text("hubrise_location_id"),
  hubriseAccessToken: text("hubrise_access_token"),
  
  currentStatus: kitchenStatusPgEnum("current_status").default("CALM").notNull(),
  statusSettings: jsonb("status_settings").$type<{
    CALM?: { fixed: number } | { min: number; max: number };
    NORMAL?: { fixed: number } | { min: number; max: number };
    RUSH?: { fixed: number } | { min: number; max: number };
    STOP?: { message?: string };
  }>(),

  /** ID de voix (ElevenLabs via VAPI) choisi par le restaurateur (null = voix par défaut). */
  voiceId: text("voice_id"),
  /** Si true, l'agent propose des upsells automatiques en fin de commande. */
  upsellEnabled: boolean("upsell_enabled").default(false).notNull(),
  /** Si true, un SMS de confirmation est envoyé au client après commande. */
  smsConfirmationEnabled: boolean("sms_confirmation_enabled").default(false).notNull(),
  /** Seuil de commandes en attente pour basculer automatiquement en mode RUSH (null = désactivé). */
  autoRushThreshold: integer("auto_rush_threshold"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  organizationMemberships: many(organizationMembers),
  restaurantMemberships: many(restaurantMembers),
}));

export const organizationMembers = pgTable("organization_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["owner", "member"] }).default("owner").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const restaurantMembers = pgTable("restaurant_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["owner", "member"] }).default("owner").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationMembers.userId],
    references: [users.id],
  }),
}));

export const restaurantMembersRelations = relations(restaurantMembers, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [restaurantMembers.restaurantId],
    references: [restaurants.id],
  }),
  user: one(users, {
    fields: [restaurantMembers.userId],
    references: [users.id],
  }),
}));

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  owner: one(users, {
    fields: [organizations.ownerId],
    references: [users.id],
  }),
  restaurants: many(restaurants),
  members: many(organizationMembers),
}));

export const restaurantsRelations = relations(restaurants, ({ one, many }) => ({
  owner: one(users, {
    fields: [restaurants.ownerId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [restaurants.organizationId],
    references: [organizations.id],
  }),
  orders: many(orders),
  members: many(restaurantMembers),
}));

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  orderNumber: text("order_number").notNull(),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  status: text("status", { enum: orderStatusEnum }).default("NEW").notNull(),
  totalAmount: integer("total_amount").default(0).notNull(),
  pickupTime: timestamp("pickup_time"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: integer("unit_price").notNull(),
  totalPrice: integer("total_price").notNull(),
  options: text("options"),
  createdAt: timestamp("created_at").defaultNow(),
});

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

export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SelectRestaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = typeof restaurants.$inferInsert;
export type SelectRole = typeof roles.$inferSelect;
export type SelectOrder = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type SelectOrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;
export type InsertOrganization = typeof organizations.$inferInsert;

export const callProviderEnum = ["vapi", "elevenlabs"] as const;
export type CallProvider = (typeof callProviderEnum)[number];

export const callStatusEnum = ["completed", "failed", "no-answer"] as const;
export type CallStatus = (typeof callStatusEnum)[number];

/**
 * Enregistrement d'un appel IA.
 * Alimenté par les webhooks VAPI (end-of-call-report) et ElevenLabs (conversation_end).
 */
export const callLogs = pgTable("call_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  /** ID de l'appel côté provider (VAPI call ID ou ElevenLabs conversation ID) */
  externalCallId: text("external_call_id").notNull(),
  provider: text("provider", { enum: callProviderEnum }).notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  status: text("status", { enum: callStatusEnum }).default("completed").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const callLogsRelations = relations(callLogs, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [callLogs.restaurantId],
    references: [restaurants.id],
  }),
  organization: one(organizations, {
    fields: [callLogs.organizationId],
    references: [organizations.id],
  }),
}));

export type SelectCallLog = typeof callLogs.$inferSelect;
export type InsertCallLog = typeof callLogs.$inferInsert;

export type SelectOrganizationMember = typeof organizationMembers.$inferSelect;
export type SelectRestaurantMember = typeof restaurantMembers.$inferSelect;
