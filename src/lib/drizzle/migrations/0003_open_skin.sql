ALTER TABLE "domains" DROP CONSTRAINT "domains_app_id_apps_id_fk";
--> statement-breakpoint
ALTER TABLE "domains" ALTER COLUMN "app_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "domains" ADD CONSTRAINT "domains_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE set null ON UPDATE no action;