import { Hono } from "hono";

import { db } from "@/db/drizzle";
import {
  hair,
  hairTransactions,
  insertHairTransactionSchema,
  orders,
} from "@/db/schema";
import { validateRequest } from "@/lib/auth/validate-request";
import {
  convertAmountFromMiliUnits,
  convertAmountToMiliUnits,
  convertNumberToNegative,
  convertNumberToPossitive,
} from "@/lib/utils";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        orderId: z.string().optional(),
      }),
    ),

    async (c) => {
      const { user } = await validateRequest();

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { orderId } = c.req.valid("query");

      const data = await db.query.hairTransactions.findMany({
        with: {
          parentHair: true,
          orderId: true,
        },
        where: and(orderId ? eq(hair.orderId, orderId) : undefined),
      });

      const r = data.map((d) => ({
        ...d,
        price: convertAmountFromMiliUnits(d.price),
      }));

      return c.json(r);
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

      const data = await db.query.hairTransactions.findFirst({
        where: eq(hairTransactions.id, id),
        with: {
          parentHair: true,
          orderId: true,
        },
      });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ ...data, price: convertAmountFromMiliUnits(data.price) });
    },
  )
  .post(
    "/",
    zValidator(
      "json",
      insertHairTransactionSchema
        .omit({ id: true })
        .refine((values) => values.price > 0, {
          message: "Price must not be 0.",
        }),
    ),
    async (c) => {
      const values = c.req.valid("json");

      const { user } = await validateRequest();

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const parentHair = await db.query.hair.findFirst({
        columns: { weightInStock: true },
        where: eq(hair.id, values.parentHairId),
      });

      if (!parentHair) {
        return c.json(
          { error: `Invalid parentHair ID: ${values.parentHairId}` },
          401,
        );
      }

      if (parentHair.weightInStock < values.weight) {
        return c.json(
          {
            error: `parentHair.weightInStock: ${parentHair.weightInStock} is less than values.weight ${values.weight}`,
          },
          401,
        );
      }

      const order = await db.query.orders.findFirst({
        columns: { orderType: true },
        where: eq(orders.id, values.orderId),
      });

      if (!order) {
        return c.json({ error: `Invalid order ID: ${values.orderId}` }, 401);
      }

      const price =
        order.orderType === "Sale"
          ? convertNumberToPossitive(convertAmountToMiliUnits(values.price))
          : convertNumberToNegative(convertAmountToMiliUnits(values.price));

      const [data] = await db
        .insert(hairTransactions)
        .values({
          id: createId(),
          ...values,
          price,
        })
        .returning();

      await db
        .update(hair)
        .set({ weightInStock: parentHair.weightInStock - values.weight })
        .where(eq(hair.id, values.parentHairId));

      await db
        .update(orders)
        .set({ requiresCalculation: true })
        .where(eq(orders.id, values.orderId));

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
    zValidator(
      "json",
      insertHairTransactionSchema
        .omit({ id: true })
        .refine((values) => values.price > 0, { message: "Price " }),
    ),
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

      const order = await db.query.orders.findFirst({
        columns: { orderType: true },
        where: eq(orders.id, values.orderId),
      });

      if (!order) {
        return c.json({ error: `Invalid order ID: ${values.orderId}` }, 401);
      }

      const price =
        order.orderType === "Sale"
          ? convertNumberToNegative(convertAmountToMiliUnits(values.price))
          : convertNumberToPossitive(convertAmountToMiliUnits(values.price));

      const [data] = await db
        .update(hairTransactions)
        .set({ ...values, price })
        .where(eq(hairTransactions.id, id))
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
          .delete(hairTransactions)
          .where(eq(hairTransactions.id, id))
          // .where(and(eq(hair.userId, auth.userId), eq(hair.id, id)))
          .returning({
            id: hairTransactions.id,
            orderId: hairTransactions.orderId,
          });

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
