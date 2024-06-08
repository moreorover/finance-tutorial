import { Hono } from "hono";

import { db } from "@/db/drizzle";
import { orders, transactions, insertOrderSchema } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { eq, sql } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

const app = new Hono()
  .get("/", clerkMiddleware(), async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const data = await db.query.orders.findMany({
      columns: {
        id: true,
        title: true,
        total: true,
        currency: true,
        placedAt: true,
        accountId: true,
      },
      with: {
        account: { columns: { fullName: true } },
        transactions: true,
      },
    });

    data.forEach((order) => {
      const totalTransactionAmount = order.transactions.reduce(
        (sum, transaction) => {
          return sum + transaction.amount;
        },
        0,
      );
      order.total = totalTransactionAmount;
    });

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

      const data = await db.query.orders.findFirst({
        with: {
          transactions: true,
          account: true,
          hair: true,
        },
        where: eq(orders.id, id),
      });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json({ data });
    },
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator("json", insertOrderSchema.omit({ id: true, total: true })),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        const [data] = await db
          .insert(orders)
          .values({
            id: createId(),
            ...values,
          })
          .returning();
        return c.json({ data });
      } catch (e) {
        console.log(e);
      }
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

      await db
        .update(transactions)
        .set({ accountId: values.accountId })
        .where(eq(transactions.orderId, id))
        .returning({ id: transactions.id });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ ...data });
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
