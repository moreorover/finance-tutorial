import { accountTags } from "@/db/schema";
import { neon } from "@neondatabase/serverless";
import { createId } from "@paralleldrive/cuid2";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const main = async () => {
  try {
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Migration completed!");

    console.log("Starting seeding...");
    await db
      .insert(accountTags)
      .values([
        {
          id: createId(),
          title: "Master",
        },
        {
          id: createId(),
          title: "Client",
        },
        {
          id: createId(),
          title: "Partner",
        },
        {
          id: createId(),
          title: "Supplier",
        },
        {
          id: createId(),
          title: "Assistant",
        },
      ])
      .onConflictDoNothing();
    console.log("Completed seeding.");
  } catch (error) {
    console.error("Error during migration: ", error);
    process.exit(1);
  }
};

main();
