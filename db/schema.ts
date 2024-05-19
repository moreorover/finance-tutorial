import { boolean, pgTable, text } from "drizzle-orm/pg-core";
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
  accounts: many(accounts),
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
  // emailAddress: z.union([z.literal(""), z.string().email()]),
});

export const accountsRelations = relations(accounts, ({ one }) => ({
  createdBy: one(users, {
    fields: [accounts.createdBy],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [accounts.updatedBy],
    references: [users.id],
  }),
}));

export const accountTags = pgTable("account_tags", {
  id: text("id").primaryKey(),
  title: text("title").unique().notNull(),
});

export const insertAccountTagSchema = createInsertSchema(accountTags);

export const accountToTags = pgTable("accountsToTags", {
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id),
  tagId: text("tag_id")
    .notNull()
    .references(() => accountTags.id),
});
