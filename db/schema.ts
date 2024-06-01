import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
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
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
}));

export const insertTransactionSchema = createInsertSchema(transactions, {
  date: z.coerce.date(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  total: integer("total").notNull(),
  currency: text("currency").notNull(),
  placedAt: timestamp("placed_at", { mode: "date" }).notNull(),
  accountId: text("account_id").references(() => accounts.id, {
    onDelete: "set null",
  }),
});

export const insertOrderSchema = createInsertSchema(orders, {
  placedAt: z.coerce.date(),
});

export const ordersRelations = relations(orders, ({ one }) => ({
  account: one(accounts, {
    fields: [orders.accountId],
    references: [accounts.id],
  }),
}));
