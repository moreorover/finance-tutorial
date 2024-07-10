import { Hono } from "hono";

import { db } from "@/db/drizzle";
import { hair, insertHairSchema, orders } from "@/db/schema";
import { validateRequest } from "@/lib/auth/validate-request";
import { convertAmountFromMiliUnits } from "@/lib/utils";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, gt } from "drizzle-orm";
import { z } from "zod";

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        orderId: z.string().optional(),
        inStock: z.string().optional(),
      }),
    ),

    async (c) => {
      const { user } = await validateRequest();

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { orderId, inStock } = c.req.valid("query");

      const data = await db.query.hair.findMany({
        with: {
          orderId: true,
          hairTransactions: true,
        },
        where: and(
          orderId ? eq(hair.orderId, orderId) : undefined,
          inStock ? gt(hair.weightInStock, 0) : undefined,
        ),
      });

      return c.json(
        data.map((hair) => ({
          ...hair,
          price: convertAmountFromMiliUnits(hair.price),
          orderId: hair.orderId
            ? {
                ...hair.orderId,
                total: convertAmountFromMiliUnits(hair.orderId.total),
              }
            : null,
          hairTransactions: hair.hairTransactions.map((transaction) => ({
            ...transaction,
            price: convertAmountFromMiliUnits(transaction.price),
          })),
        })),
      );
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

      const data = await db.query.hair.findFirst({
        with: {
          orderId: true,
          hairTransactions: true,
        },
        where: eq(hair.id, id),
      });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({
        ...data,
        price: convertAmountFromMiliUnits(data.price),
        orderId: data.orderId
          ? {
              ...data.orderId,
              total: convertAmountFromMiliUnits(data.orderId.total),
            }
          : null,
        hairTransactions: data.hairTransactions.map((transaction) => ({
          ...transaction,
          price: convertAmountFromMiliUnits(transaction.price),
        })),
      });
    },
  )
  .post(
    "/",
    zValidator("json", insertHairSchema.omit({ id: true })),
    async (c) => {
      const values = c.req.valid("json");

      const { user } = await validateRequest();

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .insert(hair)
        .values({
          id: createId(),
          ...values,
        })
        .returning();

      if (values.orderId) {
        await db
          .update(orders)
          .set({ requiresCalculation: true })
          .where(eq(orders.id, values.orderId));
      }

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
    zValidator("json", insertHairSchema.omit({ id: true })),
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
        .update(hair)
        .set(values)
        .where(eq(hair.id, id))
        .returning();

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ ...data });
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
          .delete(hair)
          .where(eq(hair.id, id))
          // .where(and(eq(hair.userId, auth.userId), eq(hair.id, id)))
          .returning({ id: hair.id, orderId: hair.orderId });

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
