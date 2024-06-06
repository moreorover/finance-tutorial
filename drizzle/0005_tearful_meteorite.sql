CREATE TABLE IF NOT EXISTS "hair" (
	"id" text PRIMARY KEY NOT NULL,
	"upc" text NOT NULL,
	"colour" text NOT NULL,
	"length" integer NOT NULL,
	"weight" integer NOT NULL,
	"weight_in_stock" integer NOT NULL,
	"seller_id" text,
	"order_id" text,
	CONSTRAINT "hair_upc_unique" UNIQUE("upc")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hair" ADD CONSTRAINT "hair_seller_id_accounts_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hair" ADD CONSTRAINT "hair_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
