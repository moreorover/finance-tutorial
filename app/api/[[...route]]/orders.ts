import { Hono } from "hono";

import { db } from "@/db/drizzle";
import { orders, transactions, insertOrderSchema, hair } from "@/db/schema";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { convertNumberToPossitive } from "@/lib/utils";
import { validateRequest } from "@/lib/auth/validate-request";

const app = new Hono()
  .get("/", async (c) => {
    const { user } = await validateRequest();

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const data = await db.query.orders.findMany({
      columns: {
        id: true,
        title: true,
        total: true,
        orderType: true,
        placedAt: true,
        accountId: true,
      },
      with: {
        account: { columns: { fullName: true } },
        transactions: true,
        hair: true,
      },
    });

    return c.json({ data });
  })
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
    zValidator("json", insertOrderSchema.omit({ id: true, total: true })),
    async (c) => {
      const values = c.req.valid("json");

      const { user } = await validateRequest();

      if (!user) {
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
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      }),
    ),
    zValidator("json", insertOrderSchema.omit({ id: true })),
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
  .post(
    "/:id/calculate",
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      }),
    ),
    async (c) => {
      const { id } = c.req.valid("param");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const { user } = await validateRequest();

      if (!user) {
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

      const orderTransactionsTotal =
        data.transactions.reduce((sum, transaction) => {
          return sum + transaction.amount;
        }, 0) / 100;

      const totalHairWeight = data.hair.reduce((sum, h) => {
        return sum + h.weight;
      }, 0);

      const totalHairFixedPrice =
        data.hair
          .filter((h) => h.isPriceFixed)
          .reduce((sum, h) => {
            return sum + h.price;
          }, 0) / 100;

      const orderTotalUnacounted = orderTransactionsTotal + totalHairFixedPrice;

      const pricePerGram = convertNumberToPossitive(
        orderTotalUnacounted / totalHairWeight,
      );

      const updateTasks = data.hair
        .filter((h) => !h.isPriceFixed)
        .map(async (h) => {
          const updatedPrice = convertNumberToPossitive(
            Math.floor(h.weight * pricePerGram * 100),
          );
          return db
            .update(hair)
            .set({ price: updatedPrice })
            .where(eq(hair.id, h.id));
        });

      // Execute all update tasks concurrently
      await Promise.all(updateTasks);

      await db
        .update(orders)
        .set({ requiresCalculation: false })
        .where(eq(orders.id, id));

      return c.json({ data: { orderId: id } });
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
