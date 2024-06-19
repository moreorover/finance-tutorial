import { z } from "zod";
import { Hono } from "hono";
import { parse, subDays } from "date-fns";
import { createId } from "@paralleldrive/cuid2";
import { zValidator } from "@hono/zod-validator";
import { eq, gte, lte, and, desc } from "drizzle-orm";

import { db } from "@/db/drizzle";
import {
  accounts,
  transactions,
  insertTransactionSchema,
  orders,
} from "@/db/schema";
import { validateRequest } from "@/lib/auth/validate-request";

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional(),
        orderId: z.string().optional(),
      }),
    ),
    async (c) => {
      const { from, to, accountId, orderId } = c.req.valid("query");

      const { user } = await validateRequest();

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const defaultTo = new Date();
      const defaultFrom = subDays(defaultTo, 30);

      const startDate = from
        ? parse(from, "yyyy-MM-dd", new Date())
        : defaultFrom;

      const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

      const data = await db
        .select({
          id: transactions.id,
          amount: transactions.amount,
          type: transactions.type,
          notes: transactions.notes,
          date: transactions.date,
          account: accounts.fullName,
          accountId: transactions.accountId,
        })
        .from(transactions)
        .leftJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
          and(
            accountId ? eq(transactions.accountId, accountId) : undefined,
            orderId ? eq(transactions.orderId, orderId) : undefined,
            gte(transactions.date, startDate),
            lte(transactions.date, endDate),
          ),
        )
        .orderBy(desc(transactions.date));

      return c.json({ data });
    },
  )
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
    async (c) => {
      const { id } = c.req.valid("param");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const { user } = await validateRequest();

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .select({
          id: transactions.id,
          amount: transactions.amount,
          type: transactions.type,
          notes: transactions.notes,
          date: transactions.date,
          account: accounts.fullName,
          accountId: transactions.accountId,
          orderId: transactions.orderId,
        })
        .from(transactions)
        .leftJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(eq(transactions.id, id));

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json({ data });
    },
  )
  .post(
    "/",
    zValidator("json", insertTransactionSchema.omit({ id: true })),
    async (c) => {
      const values = c.req.valid("json");

      const { user } = await validateRequest();

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // try {
      const [data] = await db
        .insert(transactions)
        .values({
          id: createId(),
          ...values,
        })
        .returning();

      if (!data) {
        return c.json({ error: "Failed to create transaction" }, 500);
      }

      if (data.orderId) {
        try {
          const orderTransactions = await db.query.transactions.findMany({
            columns: {
              amount: true,
            },
            where: eq(transactions.orderId, data.orderId),
          });

          const orderTotal = orderTransactions.reduce((sum, transaction) => {
            return sum + transaction.amount;
          }, 0);

          await db
            .update(orders)
            .set({ total: orderTotal })
            .where(eq(orders.id, data.orderId));
        } catch (error) {
          return c.json({ error: "Failed to update order total" }, 500);
        }
      }

      return c.json({ data });
      // } catch (e) {
      // return c.json({ error: e }, 404);
      // }
    },
  )
  .post(
    "/bulk-create",
    zValidator("json", z.array(insertTransactionSchema)),
    async (c) => {
      const values = c.req.valid("json");

      const { user } = await validateRequest();

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = await db
        .insert(transactions)
        .values(
          values.map((value) => ({
            ...value,
          })),
        )
        .returning();

      return c.json({ data });
    },
  )
  .patch(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      }),
    ),
    zValidator("json", insertTransactionSchema.omit({ id: true })),
    async (c) => {
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const { user } = await validateRequest();

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .update(transactions)
        .set({ ...values })
        .where(eq(transactions.id, id))
        .returning();

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      if (!data) {
        return c.json({ error: "Failed to create transaction" }, 500);
      }

      if (data.orderId) {
        try {
          const orderTransactions = await db.query.transactions.findMany({
            columns: {
              amount: true,
            },
            where: eq(transactions.orderId, data.orderId),
          });

          const orderTotal = orderTransactions.reduce((sum, transaction) => {
            return sum + transaction.amount;
          }, 0);

          await db
            .update(orders)
            .set({ total: orderTotal })
            .where(eq(orders.id, data.orderId));
        } catch (error) {
          return c.json({ error: "Failed to update order total" }, 500);
        }
      }

      return c.json({ data });
    },
  )
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
    async (c) => {
      const { id } = c.req.valid("param");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const { user } = await validateRequest();

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .delete(transactions)
        .where(eq(transactions.id, id))
        .returning({ id: transactions.id, orderId: transactions.orderId });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      if (data && data.orderId) {
        try {
          const orderTransactions = await db.query.transactions.findMany({
            columns: {
              amount: true,
            },
            where: eq(transactions.orderId, data.orderId),
          });

          const orderTotal = orderTransactions.reduce((sum, transaction) => {
            return sum + transaction.amount;
          }, 0);

          await db
            .update(orders)
            .set({ total: orderTotal })
            .where(eq(orders.id, data.orderId));
        } catch (error) {
          return c.json({ error: "Failed to update order total" }, 500);
        }
      }

      return c.json(data);
    },
  );

export default app;
