import { pgTable, text, timestamp, uuid, boolean, integer, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = ["ADMIN", "OWNER"] as const;
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
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role", { enum: userRoleEnum }).default("OWNER").notNull(),
  mustChangePassword: boolean("must_change_password").default(false).notNull(),
  resetToken: text("reset_token"),
  resetTokenExpires: timestamp("reset_token_expires"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const restaurants = pgTable("restaurants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address"),
  phoneNumber: text("phone_number").notNull(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  status: restaurantStatusPgEnum("status").default("onboarding").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  
  plan: restaurantPlanPgEnum("plan").default("commission"),
  commissionRate: integer("commission_rate").default(5),
  stripeCustomerId: text("stripe_customer_id"),
  billingStartDate: text("billing_start_date"),
  
  vapiAssistantId: text("vapi_assistant_id"),
  systemPrompt: text("system_prompt"),
  menuContext: text("menu_context"),
  
  // Nouveau champ: stockage document-oriented du menu complet
  menuData: jsonb("menu_data").$type<MenuData>(),
  
  twilioPhoneNumber: text("twilio_phone_number"),
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
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
  orders: many(orders),
}));

export const pricingConfig = pgTable("pricing_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  monthlyPrice: integer("monthly_price").default(14900).notNull(),
  setupFee: integer("setup_fee").default(19900).notNull(),
  includedMinutes: integer("included_minutes").default(600).notNull(),
  overflowPricePerMinute: integer("overflow_price_per_minute").default(20).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SelectRestaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = typeof restaurants.$inferInsert;
export type SelectOrder = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type SelectOrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;
