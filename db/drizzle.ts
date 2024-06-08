import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  users,
  usersRelations,
  accounts,
  accountsRelations,
  accountTags,
  accountToTags,
  transactionType,
  transactions,
  transactionsRelations,
  orders,
  ordersRelations,
  hair,
  hairRelations,
} from "@/db/schema";
export const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, {
  schema: {
    users,
    usersRelations,
    accounts,
    accountsRelations,
    accountTags,
    accountToTags,
    transactionType,
    transactions,
    transactionsRelations,
    orders,
    ordersRelations,
    hair,
    hairRelateions: hairRelations,
  },
});
