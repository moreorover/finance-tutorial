import { Lucia, TimeSpan } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { env } from "@/env";
import { db } from "@/db/drizzle";
import { sessions, users, type User as DbUser } from "@/db/schema";
import { absoluteUrl } from "@/lib/utils";

// Uncomment the following lines if you are using nodejs 18 or lower. Not required in Node.js 20, CloudFlare Workers, Deno, Bun, and Vercel Edge Functions.
// import { webcrypto } from "node:crypto";
// globalThis.crypto = webcrypto as Crypto;

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  getSessionAttributes: (/* attributes */) => {
    return {};
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      email: attributes.email,
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt,
    };
  },
  sessionExpiresIn: new TimeSpan(1, "d"),
  sessionCookie: {
    name: "session",

    expires: true, // session cookies have very long lifespan (2 years)
    attributes: {
      secure: env.NODE_ENV === "production",
    },
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseSessionAttributes {}
interface DatabaseUserAttributes extends Omit<DbUser, "hashedPassword"> {}
