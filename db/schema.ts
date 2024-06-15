import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  deleted: boolean("is_deleted").default(false),
});

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
  "business-account-billing",
  "Deposit",
]);

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  amount: integer("amount").notNull(),
  type: transactionType("type"),
  notes: text("notes"),
  currency: text("currency").notNull(),
  date: timestamp("date", { mode: "date" }).notNull(),
  accountId: text("account_id").references(() => accounts.id, {
    onDelete: "set null",
  }),
  orderId: text("order_id").references(() => orders.id, {
    onDelete: "set null",
  }),
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

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  total: integer("total").notNull().default(0),
  currency: text("currency").notNull(),
  requiresCalculation: boolean("requires_calculation").notNull().default(false),
  placedAt: timestamp("placed_at", { mode: "date" }).notNull(),
  accountId: text("account_id").references(() => accounts.id, {
    onDelete: "set null",
  }),
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
}));

export const hair = pgTable("hair", {
  id: text("id").primaryKey(),
  upc: text("upc").unique().notNull(),
  colour: text("colour").notNull(),
  length: integer("length").notNull(),
  weight: integer("weight").notNull(),
  price: integer("price").notNull().default(0),
  isPriceFixed: boolean("is_price_fixed").notNull().default(false),
  weightInStock: integer("weight_in_stock").notNull(),
  sellerId: text("seller_id").references(() => accounts.id, {
    onDelete: "set null",
  }),
  orderId: text("order_id").references(() => orders.id, {
    onDelete: "set null",
  }),
});

export const hairRelations = relations(hair, ({ one }) => ({
  seller: one(accounts, {
    fields: [hair.sellerId],
    references: [accounts.id],
  }),
  orderId: one(orders, {
    fields: [hair.orderId],
    references: [orders.id],
  }),
}));

export const insertHairSchema = createInsertSchema(hair);
