CREATE INDEX IF NOT EXISTS "hair_upc_idx" ON "hair" ("upc");--> statement-breakpoint
ALTER TABLE "hair" DROP COLUMN IF EXISTS "colour";