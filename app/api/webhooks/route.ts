import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Do something with the payload
  // For this guide, you simply log the payload to the console
  // const { id } = evt.data;
  const eventType = evt.type;

  if (eventType == "user.created") {
    console.log(`Processing webhook ${eventType}`);
    const {
      id,
      first_name,
      last_name,
      primary_email_address_id,
      email_addresses,
    } = evt.data;

    const fullName = `${first_name?.trim()} ${last_name?.trim()}`;

    const email =
      email_addresses.find((email) => email.id === primary_email_address_id)
        ?.email_address || "";

    const [data] = await db
      .insert(users)
      .values({
        id,
        fullName,
        email,
        deleted: false,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: { fullName, email, deleted: false },
      })
      .returning();

    if (!data) {
      return new Response("", { status: 404 });
    }

    console.log(`Processed webhook ${eventType}`);
  }

  if (eventType == "user.updated") {
    console.log(`Processing webhook ${eventType}`);
    const {
      id,
      first_name,
      last_name,
      primary_email_address_id,
      email_addresses,
    } = evt.data;

    const fullName = `${first_name?.trim()} ${last_name?.trim()}`;

    const email =
      email_addresses.find((email) => email.id === primary_email_address_id)
        ?.email_address || "";

    const [data] = await db
      .update(users)
      .set({
        fullName,
        email,
      })
      .where(or(eq(users.id, id)))
      .returning();

    if (!data) {
      return new Response("", { status: 404 });
    }

    console.log(`Processed webhook ${eventType}`);
  }

  if (eventType == "user.deleted") {
    console.log(`Processing webhook ${eventType}`);
    const { id } = evt.data;

    if (!id) {
      return new Response("ID not received.", { status: 404 });
    }

    const [data] = await db
      .update(users)
      .set({
        deleted: true,
      })
      .where(eq(users.id, id))
      .returning();

    if (!data) {
      return new Response("", { status: 404 });
    }

    console.log(`Processed webhook ${eventType}`);
  }

  if (
    eventType != "user.created" &&
    eventType != "user.updated" &&
    eventType != "user.deleted"
  ) {
    console.log(`Skipping webhook ${eventType}`);
  }
  return new Response("", { status: 200 });
}
