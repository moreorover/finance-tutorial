ALTER TABLE "transactions" RENAME COLUMN "transaction_id" TO "order_id";--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_transaction_id_orders_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
