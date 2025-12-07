import { pgTable, timestamp, text, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { domains } from './domains';

export const apps = pgTable('apps', {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  name: text('name').notNull(),
  embbedUrl: text('embbed_url').notNull(),
  imageUrl: text('image_url').notNull(),
  language: text('language', {
    enum: ['pt', 'en', 'es', 'fr', 'de']
  }).notNull().default('pt'),
  domainId: uuid('domain_id'),
  customDomain: text('custom_domain').unique(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const appsRelations = relations(apps, ({ one }) => ({
  domain: one(domains, {
    fields: [apps.domainId],
    references: [domains.id],
  }),
}));

export const appSchema = createSelectSchema(apps);

export type TApp = z.infer<typeof appSchema>;
