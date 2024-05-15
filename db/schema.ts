import { pgTable, text } from "drizzle-orm/pg-core";

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  lastName: text("last_name").notNull(),
  userId: text("user_id").notNull(),
});
