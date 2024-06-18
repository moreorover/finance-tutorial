import { Hono } from "hono";

import { db } from "@/db/drizzle";
import {
  accountTags,
  accountToTags,
  accounts,
  insertAccountsSchema,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { validateRequest } from "@/lib/auth/validate-request";

const app = new Hono()
  .get("/", async (c) => {
    const { user } = await validateRequest();

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const data = await db.query.accounts.findMany();
    // .where(eq(accounts.userId, auth.userId));

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
    },
  )
  .get(
    "/:id/tags",
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
    },
  )
  .post(
    "/:id/updateTags",

    zValidator("param", z.object({ id: z.string().optional() })),
    zValidator("json", z.object({ tagIds: z.array(z.string()) })),
    async (c) => {
      const values = c.req.valid("json");
      const { id } = c.req.valid("param");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const { user } = await validateRequest();

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
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
    },
  )
  .post(
    "/",
    zValidator(
      "json",
      insertAccountsSchema.pick({
        fullName: true,
        instagram: true,
        emailAddress: true,
        phoneNumber: true,
      }),
    ),
    async (c) => {
      const values = c.req.valid("json");

      const { user } = await validateRequest();

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .insert(accounts)
        .values({
          id: createId(),
          createdBy: user.id,
          ...values,
        })
        .returning();

      return c.json({ data });
    },
  )
  .post(
    "/bulk-delete",
    zValidator("json", z.object({ ids: z.array(z.string()) })),
    async (c) => {
      const values = c.req.valid("json");

      const { user } = await validateRequest();

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = await db
        .delete(accounts)
        .where(
          // eq(accounts.userId, auth.userId),
          inArray(accounts.id, values.ids),
        )
        .returning({ id: accounts.id });

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
      insertAccountsSchema.pick({
        fullName: true,
        instagram: true,
        emailAddress: true,
        phoneNumber: true,
      }),
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

      const [data] = await db
        .update(accounts)
        .set({ updatedBy: user.id, ...values })
        .where(eq(accounts.id, id))
        .returning();

      if (!data) {
        return c.json({ error: "Not found" }, 404);
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

      try {
        const [data] = await db
          .delete(accounts)
          .where(eq(accounts.id, id))
          // .where(and(eq(accounts.userId, auth.userId), eq(accounts.id, id)))
          .returning({ id: accounts.id });

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
