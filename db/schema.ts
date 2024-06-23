import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    hashedPassword: varchar("hashed_password", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(
      () => new Date(),
    ),
  },
  (t) => ({
    emailIdx: index("user_email_idx").on(t.email),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const sessions = pgTable(
  "sessions",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 21 }).notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
  },
  (t) => ({
    userIdx: index("session_user_idx").on(t.userId),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  accountsCreated: many(accounts, { relationName: "createdBy" }),
  accountsUpdated: many(accounts, { relationName: "updatedBy" }),
}));

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  instagram: text("instagram").notNull(),
  emailAddress: text("email_address").notNull(),
  phoneNumber: text("phone_number").notNull(),
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by"),
});

export const insertAccountsSchema = createInsertSchema(accounts, {
  emailAddress: z.union([z.literal(""), z.string().email()]),
});

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  createdBy: one(users, {
    relationName: "createdBy",
    fields: [accounts.createdBy],
    references: [users.id],
  }),
  updatedBy: one(users, {
    relationName: "updatedBy",
    fields: [accounts.updatedBy],
    references: [users.id],
  }),
  transactions: many(transactions),
  orders: many(orders),
  hair: many(hair),
}));

export const accountTags = pgTable("account_tags", {
  id: text("id").primaryKey(),
  title: text("title").unique().notNull(),
});

export const insertAccountTagSchema = createInsertSchema(accountTags);

export const accountToTags = pgTable("accounts_to_tags", {
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  tagId: text("tag_id")
    .notNull()
    .references(() => accountTags.id),
});

export const insetAccountToTagsSchema = createInsertSchema(accountToTags);

export const transactionType = pgEnum("transactionType", [
  "Cash",
  "Direct Debit",
  "Faster payment",
  "Card payment",
  "Deposit",
  "business-account-billing",
]);

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  amount: integer("amount").notNull(),
  type: transactionType("type").notNull(),
  notes: text("notes"),
  date: timestamp("date", { mode: "date" }).notNull(),
  accountId: text("account_id").references(() => accounts.id, {
    onDelete: "set null",
  }),
  orderId: text("order_id").references(() => orders.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(
    () => new Date(),
  ),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  order: one(orders, {
    fields: [transactions.orderId],
    references: [orders.id],
    relationName: "transactions",
  }),
}));

export const insertTransactionSchema = createInsertSchema(transactions, {
  date: z.coerce.date(),
});

export const orderType = pgEnum("orderType", ["Sale", "Purchase"]);

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  total: integer("total").notNull().default(0),
  orderType: orderType("order_type").notNull(),
  requiresCalculation: boolean("requires_calculation").notNull().default(false),
  placedAt: timestamp("placed_at", { mode: "date" }).notNull(),
  accountId: text("account_id").references(() => accounts.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(
    () => new Date(),
  ),
});

export const insertOrderSchema = createInsertSchema(orders, {
  placedAt: z.coerce.date(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  account: one(accounts, {
    fields: [orders.accountId],
    references: [accounts.id],
  }),
  transactions: many(transactions, {
    relationName: "transactions",
  }),
  hair: many(hair),
  hairTransactions: many(hairTransactions),
}));

export const hair = pgTable(
  "hair",
  {
    id: text("id").primaryKey(),
    upc: text("upc").unique().notNull(),
    length: integer("length").notNull(),
    weight: integer("weight").notNull(),
    price: integer("price").notNull().default(0),
    isPriceFixed: boolean("is_price_fixed").notNull().default(false),
    weightInStock: integer("weight_in_stock").notNull(),
    orderId: text("order_id").references(() => orders.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(
      () => new Date(),
    ),
  },
  (t) => ({
    hairIdx: index("hair_upc_idx").on(t.upc),
  }),
);

export const hairRelations = relations(hair, ({ one, many }) => ({
  orderId: one(orders, {
    fields: [hair.orderId],
    references: [orders.id],
  }),
  hairTransactions: many(hairTransactions),
}));

export const insertHairSchema = createInsertSchema(hair);
export const selectHairSchema = createSelectSchema(hair);

export const hairTransactions = pgTable("hair_transactions", {
  id: text("id").primaryKey(),
  parentHairId: text("parent_hair_id")
    .references(() => hair.id, {
      onDelete: "cascade",
    })
    .notNull(),
  weight: integer("weight").notNull(),
  price: integer("price").notNull(),
  orderId: text("order_id")
    .references(() => orders.id, {
      onDelete: "set null",
    })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(
    () => new Date(),
  ),
});

export const insertHairTransactionSchema = createInsertSchema(hairTransactions);

export const hairTransactionRelations = relations(
  hairTransactions,
  ({ one }) => ({
    parentHair: one(hair, {
      fields: [hairTransactions.parentHairId],
      references: [hair.id],
    }),
    orderId: one(orders, {
      fields: [hairTransactions.orderId],
      references: [orders.id],
    }),
  }),
);
