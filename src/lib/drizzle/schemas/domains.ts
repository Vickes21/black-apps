import { pgTable, timestamp, text, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { apps } from './apps';

export const domains = pgTable('domains', {
  id: uuid("id").primaryKey().defaultRandom(),
  appId: uuid("app_id").references(() => apps.id, { onDelete: 'set null' }),
  userId: text("user_id").notNull(),
  hostname: text('hostname').notNull().unique(),
  cloudflareId: text('cloudflare_id'),
  status: text('status', { 
    enum: ['pending', 'active', 'failed', 'deleted'] 
  }).notNull().default('pending'),
  sslStatus: text('ssl_status', { 
    enum: ['pending', 'active', 'failed'] 
  }),
  verificationErrors: text('verification_errors'),
  ownershipVerification: text('ownership_verification'),
  ownershipVerificationHttp: text('ownership_verification_http'),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().$onUpdate(() => new Date()).notNull(),
  verifiedAt: timestamp("verified_at", { mode: "date" }),
});

export const domainsRelations = relations(domains, ({ one }) => ({
  app: one(apps, {
    fields: [domains.appId],
    references: [apps.id],
  }),
}));

export const domainSchema = createSelectSchema(domains);

export type TDomain = z.infer<typeof domainSchema>;
