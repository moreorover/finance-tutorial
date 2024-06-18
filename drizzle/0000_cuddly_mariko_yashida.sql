DO $$ BEGIN
 CREATE TYPE "public"."transactionType" AS ENUM('Cash', 'Direct Debit', 'Faster payment', 'Card payment', 'business-account-billing', 'Deposit');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account_tags" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	CONSTRAINT "account_tags_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts_to_tags" (
	"account_id" text NOT NULL,
	"tag_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"instagram" text NOT NULL,
	"email_address" text NOT NULL,
	"phone_number" text NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hair" (
	"id" text PRIMARY KEY NOT NULL,
	"upc" text NOT NULL,
	"colour" text NOT NULL,
	"length" integer NOT NULL,
	"weight" integer NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"is_price_fixed" boolean DEFAULT false NOT NULL,
	"weight_in_stock" integer NOT NULL,
	"seller_id" text,
	"order_id" text,
	CONSTRAINT "hair_upc_unique" UNIQUE("upc")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"currency" text NOT NULL,
	"requires_calculation" boolean DEFAULT false NOT NULL,
	"placed_at" timestamp NOT NULL,
	"account_id" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"amount" integer NOT NULL,
	"type" "transactionType",
	"notes" text,
	"currency" text NOT NULL,
	"date" timestamp NOT NULL,
	"account_id" text,
	"order_id" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"hashed_password" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts_to_tags" ADD CONSTRAINT "accounts_to_tags_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts_to_tags" ADD CONSTRAINT "accounts_to_tags_tag_id_account_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."account_tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
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
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_idx" ON "sessions" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_email_idx" ON "users" ("email");