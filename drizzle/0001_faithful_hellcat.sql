CREATE TABLE IF NOT EXISTS "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text,
	"total" integer NOT NULL,
	"currency" text NOT NULL,
	"placed_at" timestamp NOT NULL,
	"received_at" timestamp,
	"account_id" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
