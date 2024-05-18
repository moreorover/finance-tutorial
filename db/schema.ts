import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

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
  name: text("name").notNull(),
  lastName: text("last_name").notNull(),
  createdBy: text("created_by").notNull(),
});

export const insertAccountSchema = createInsertSchema(accounts);

export const accountsRelations = relations(accounts, ({ one }) => ({
  created_by: one(users, {
    fields: [accounts.createdBy],
    references: [users.id],
  }),
}));
