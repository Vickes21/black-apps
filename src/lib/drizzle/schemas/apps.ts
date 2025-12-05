import { pgTable, timestamp, text, uuid } from 'drizzle-orm/pg-core';

import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const apps = pgTable('apps', {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  name: text('name').notNull(),
  embbedUrl: text('embbed_url').notNull(),
  imageUrl: text('image_url').notNull(),
  customDomain: text('custom_domain').unique(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()).notNull(),
});


export const appSchema = createSelectSchema(apps)

export type TApp = z.infer<typeof appSchema>
