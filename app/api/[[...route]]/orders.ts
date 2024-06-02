import { Hono } from "hono";

import { db } from "@/db/drizzle";
import { accounts, orders, transactions, insertOrderSchema } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { eq, desc } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

const app = new Hono()
  .get("/", clerkMiddleware(), async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const data = await db
      .select({
        id: orders.id,
        title: orders.title,
        total: orders.total,
        currency: orders.currency,
        placedAt: orders.placedAt,
        account: accounts.fullName,
        accountId: orders.accountId,
      })
      .from(orders)
      .leftJoin(accounts, eq(orders.accountId, accounts.id))
      .orderBy(desc(orders.placedAt));

    return c.json({ data });
  })
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
          id: orders.id,
          title: orders.title,
          total: orders.total,
          currency: orders.currency,
          placedAt: orders.placedAt,
          account: accounts.fullName,
          accountId: orders.accountId,
          transactions: {
            id: transactions.id,
            amount: transactions.amount,
            type: transactions.type,
            currency: transactions.currency,
            date: transactions.date,
          },
        })
        .from(orders)
        .leftJoin(accounts, eq(orders.accountId, accounts.id))
        .leftJoin(transactions, eq(transactions.orderId, id))
        .orderBy(desc(orders.placedAt))
        .where(eq(orders.id, id));

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json({ data });
    },
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator("json", insertOrderSchema.omit({ id: true })),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .insert(orders)
        .values({
          id: createId(),
          ...values,
        })
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
    zValidator("json", insertOrderSchema.omit({ id: true })),
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
        .update(orders)
        .set(values)
        .where(eq(orders.id, id))
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

      try {
        const [data] = await db
          .delete(orders)
          .where(eq(orders.id, id))
          // .where(and(eq(orders.userId, auth.userId), eq(orders.id, id)))
          .returning({ id: orders.id });

        if (!data) {
          return c.json({ error: "Not found" }, 404);
        }
        return c.json({ data });
      } catch (e) {
        console.log(e);
      }
      return c.json({ error: "Internal error" }, 404);
    },
  );

export default app;
