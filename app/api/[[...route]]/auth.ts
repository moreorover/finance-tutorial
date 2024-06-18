import { Hono } from "hono";

import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { validateRequest } from "@/lib/auth/validate-request";
import { lucia } from "@/lib/auth/lucia";
import { generateId, Scrypt } from "lucia";

const app = new Hono()
  .get("/", async (c) => {
    const { user } = await validateRequest();

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    return c.json({ user });
  })
  .post(
    "/signup",
    zValidator(
      "json",
      z.object({
        email: z.string(),
        password: z.string().min(6),
      }),
    ),
    async (c) => {
      const values = c.req.valid("json");

      const { user } = await validateRequest();

      if (user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const existingUser = await db.query.users.findFirst({
        where: (table, { eq }) => eq(table.email, values.email),
        columns: { email: true },
      });

      if (existingUser) {
        return c.json({ error: "Cannot create account." }, 404);
      }

      const passwordHash = await new Scrypt().hash(values.password);

      const userId = generateId(21);

      const [data] = await db
        .insert(users)
        .values({
          id: userId,
          email: values.email,
          hashedPassword: passwordHash,
        })
        .returning();

      const session = await lucia.createSession(userId, {});
      // const sessionCookie = lucia.createSessionCookie(session.id);
      // cookies().set(
      //   sessionCookie.name,
      //   sessionCookie.value,
      //   sessionCookie.attributes,
      // );

      c.res.headers.set(
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize(),
      );

      return c.json({ id: data.id, email: data.email });
    },
  )
  .post(
    "/signin",
    zValidator(
      "json",
      z.object({
        email: z.string(),
        password: z.string().min(6),
      }),
    ),
    async (c) => {
      const values = c.req.valid("json");

      const { user } = await validateRequest();

      if (user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const existingUser = await db.query.users.findFirst({
        where: (table, { eq }) => eq(table.email, values.email),
        columns: { id: true, email: true, hashedPassword: true },
      });

      if (!existingUser) {
        return c.json({ error: "Cannot sign in to this account." }, 404);
      }

      const validPassword = await new Scrypt().verify(
        existingUser.hashedPassword || "",
        values.password,
      );

      if (!validPassword) {
        return c.json({ error: "Cannot sign in to this account." }, 404);
      }

      const session = await lucia.createSession(existingUser.id, {});
      // const sessionCookie = lucia.createSessionCookie(session.id);
      // cookies().set(
      // sessionCookie.name,
      // sessionCookie.value,
      // sessionCookie.attributes,
      // );

      c.res.headers.set(
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize(),
      );

      return c.json({ id: existingUser.id, email: existingUser.email });
    },
  );

export default app;
