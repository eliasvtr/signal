import { pgTable, text, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const feeds = pgTable('feeds', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 50 }).notNull(), // 'x_list', 'youtube', 'rss'
  name: text('name').notNull(), // e.g. "Tech Content"
  url: text('url').notNull(),   // The raw list URL or youtube channel ID
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const seenItems = pgTable('seen_items', {
  id: serial('id').primaryKey(),
  itemUrl: text('item_url').notNull().unique(), // Unique identifier for the item (e.g. tweet/video link)
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
