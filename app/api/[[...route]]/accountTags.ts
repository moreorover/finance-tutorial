import { Hono } from "hono";

import { db } from "@/db/drizzle";
import { accountTags, insertAccountTagSchema } from "@/db/schema";
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

    const data = await db
      .select({
        id: accountTags.id,
        title: accountTags.title,
      })
      .from(accountTags);
    // .where(eq(accountTags.userId, auth.userId));

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
          id: accountTags.id,
          title: accountTags.title,
        })
        .from(accountTags)
        .where(eq(accountTags.id, id));

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json({ data });
    },
  )
  .post(
    "/",
    zValidator(
      "json",
      insertAccountTagSchema.pick({
        title: true,
      }),
    ),
    async (c) => {
      const values = c.req.valid("json");

      const { user } = await validateRequest();

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .insert(accountTags)
        .values({
          id: createId(),
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
        .delete(accountTags)
        .where(
          // eq(accountTags.userId, auth.userId),
          inArray(accountTags.id, values.ids),
        )
        .returning({ id: accountTags.id });

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
      insertAccountTagSchema.pick({
        title: true,
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
        .update(accountTags)
        .set(values)
        .where(eq(accountTags.id, id))
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

      const [data] = await db
        .delete(accountTags)
        .where(eq(accountTags.id, id))
        // .where(and(eq(accountTags.userId, auth.userId), eq(accountTags.id, id)))
        .returning({ id: accountTags.id });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json({ data });
    },
  );

export default app;
