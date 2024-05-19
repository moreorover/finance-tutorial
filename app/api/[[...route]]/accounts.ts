import { Hono } from "hono";

import { db } from "@/db/drizzle";
import {
  accountTags,
  accountToTags,
  accounts,
  insertAccountsSchema,
  insetAccountToTagsSchema,
} from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { eq, inArray } from "drizzle-orm";
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
        id: accounts.id,
        fullName: accounts.fullName,
        instagram: accounts.instagram,
        emailAddress: accounts.emailAddress,
        phoneNumber: accounts.phoneNumber,
      })
      .from(accounts);
    // .where(eq(accounts.userId, auth.userId));

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
          id: accounts.id,
          fullName: accounts.fullName,
          instagram: accounts.instagram,
          emailAddress: accounts.emailAddress,
          phoneNumber: accounts.phoneNumber,
        })
        .from(accounts)
        .where(eq(accounts.id, id));

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json({ data });
    }
  )
  .get(
    "/:id/tags",
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

      const data = await db
        .select({
          id: accountTags.id,
          title: accountTags.title,
        })
        .from(accountTags)
        .leftJoin(accountToTags, eq(accountToTags.tagId, accountTags.id))
        .where(eq(accountToTags.accountId, id));

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json({ data });
    }
  )
  .post(
    "/:id/updateTags",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string().optional() })),
    zValidator("json", z.object({ tagIds: z.array(z.string()) })),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");
      const { id } = c.req.valid("param");

      // console.log(JSON.stringify(values, null, 2));

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const mappedValues = values.tagIds.map((tagId) => ({
        accountId: id,
        tagId: tagId,
      }));

      await db.delete(accountToTags).where(eq(accountToTags.accountId, id));
      const data = await db
        .insert(accountToTags)
        .values(mappedValues)
        .returning();

      return c.json({ data });
    }
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      insertAccountsSchema.pick({
        fullName: true,
        instagram: true,
        emailAddress: true,
        phoneNumber: true,
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .insert(accounts)
        .values({
          id: createId(),
          createdBy: auth.userId,
          ...values,
        })
        .returning();

      return c.json({ data });
    }
  )
  .post(
    "/bulk-delete",
    clerkMiddleware(),
    zValidator("json", z.object({ ids: z.array(z.string()) })),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = await db
        .delete(accounts)
        .where(
          // eq(accounts.userId, auth.userId),
          inArray(accounts.id, values.ids)
        )
        .returning({ id: accounts.id });

      return c.json({ data });
    }
  )
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    zValidator(
      "json",
      insertAccountsSchema.pick({
        fullName: true,
        instagram: true,
        emailAddress: true,
        phoneNumber: true,
      })
    ),
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
        .update(accounts)
        .set({ updatedBy: auth.userId, ...values })
        .where(eq(accounts.id, id))
        .returning();

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data });
    }
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
        .delete(accounts)
        .where(eq(accounts.id, id))
        // .where(and(eq(accounts.userId, auth.userId), eq(accounts.id, id)))
        .returning({ id: accounts.id });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json({ data });
    }
  );

export default app;
