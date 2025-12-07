ALTER TABLE "apps" DROP CONSTRAINT "apps_domain_id_domains_id_fk";
--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "language" text DEFAULT 'pt' NOT NULL;