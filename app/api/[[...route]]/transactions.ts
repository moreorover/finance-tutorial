import { Hono } from "hono";

import { db } from "@/db/drizzle";
import { accounts, transactions, insertTransactionSchema } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { eq, inArray, gte, lte, and, desc } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { parse, subDays } from "date-fns";

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
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c);
      const { from, to, accountId, orderId } = c.req.valid("query");

      if (!auth?.userId) {
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
          currency: transactions.currency,
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
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string().optional() })),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid("param");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .select({
          id: transactions.id,
          amount: transactions.amount,
          type: transactions.type,
          notes: transactions.notes,
          currency: transactions.currency,
          date: transactions.date,
          account: accounts.fullName,
          accountId: transactions.accountId,
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
    clerkMiddleware(),
    zValidator("json", insertTransactionSchema),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      // try {
      const [data] = await db
        .insert(transactions)
        .values({
          ...values,
          id: values.id && values.id.length > 0 ? values.id : createId(),
        })
        .returning();
      return c.json({ data });
      // } catch (e) {
      // console.log(e);
      // }
    },
  )
  .post(
    "/bulk-create",
    clerkMiddleware(),
    zValidator("json", z.array(insertTransactionSchema)),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (!auth?.userId) {
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
    clerkMiddleware(),
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      }),
    ),
    zValidator("json", insertTransactionSchema.omit({ id: true })),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      if (!auth?.userId) {
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

      return c.json({ data });
    },
  )
  .delete(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string().optional() })),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid("param");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .delete(transactions)
        .where(eq(transactions.id, id))
        .returning({ id: transactions.id });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json({ data });
    },
  );

export default app;
