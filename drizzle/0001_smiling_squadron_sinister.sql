CREATE TABLE IF NOT EXISTS "account_tags" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text,
	CONSTRAINT "account_tags_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accountsToTags" (
	"account_id" text NOT NULL,
	"tag_id" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accountsToTags" ADD CONSTRAINT "accountsToTags_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accountsToTags" ADD CONSTRAINT "accountsToTags_tag_id_account_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."account_tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
