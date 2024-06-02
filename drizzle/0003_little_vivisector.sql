ALTER TABLE "transactions" ADD COLUMN "transaction_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_transaction_id_orders_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
