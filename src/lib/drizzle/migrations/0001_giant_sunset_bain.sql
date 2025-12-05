ALTER TABLE "apps" ADD COLUMN "custom_domain" text;--> statement-breakpoint
ALTER TABLE "apps" ADD CONSTRAINT "apps_custom_domain_unique" UNIQUE("custom_domain");