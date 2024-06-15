ALTER TABLE "hair" ADD COLUMN "price" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "hair" ADD COLUMN "is_price_fixed" boolean DEFAULT false NOT NULL;