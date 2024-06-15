import { Hono } from "hono";

import { db } from "@/db/drizzle";
import { accounts, hair, orders, insertHairSchema } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { eq, and } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        orderId: z.string().optional(),
        sellerId: z.string().optional(),
      }),
    ),
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c);

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { sellerId, orderId } = c.req.valid("query");

      const data = await db
        .select({
          id: hair.id,
          upc: hair.upc,
          colour: hair.colour,
          length: hair.length,
          weight: hair.weight,
          weightInStock: hair.weightInStock,
          seller: accounts.fullName,
          sellerId: hair.sellerId,
          orderId: hair.orderId,
        })
        .from(hair)
        .leftJoin(accounts, eq(hair.sellerId, accounts.id))
        .leftJoin(orders, eq(hair.orderId, orders.id))
        .where(
          and(
            sellerId ? eq(hair.sellerId, sellerId) : undefined,
            orderId ? eq(hair.orderId, orderId) : undefined,
          ),
        );

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
        // this returns a first object from the array
        // there will be as many objects in the array as many transactions for the order
        .select({
          id: hair.id,
          upc: hair.upc,
          colour: hair.colour,
          length: hair.length,
          weight: hair.weight,
          price: hair.price,
          isPriceFixed: hair.isPriceFixed,
          weightInStock: hair.weightInStock,
          seller: accounts.fullName,
          sellerId: hair.sellerId,
          orderId: hair.orderId,
        })
        .from(hair)
        .leftJoin(accounts, eq(hair.sellerId, accounts.id))
        .leftJoin(orders, eq(hair.orderId, orders.id))
        .where(eq(hair.id, id));

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json({ data });
    },
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator("json", insertHairSchema.omit({ id: true })),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // try {
      const [data] = await db
        .insert(hair)
        .values({
          id: createId(),
          ...values,
        })
        .returning();

      return c.json({ data });
      // } catch (e) {
      // console.log(e);
      // }
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
    zValidator("json", insertHairSchema.omit({ id: true })),
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
