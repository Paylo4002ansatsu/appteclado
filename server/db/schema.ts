import { sql } from 'drizzle-orm';
import {
  boolean,
  datetime,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';
import type { ModuleSnapshot, PublishedModuleMetadata } from '../../src/data/courseTypes.js';

export const levels = mysqlTable('levels', {
  id: varchar('id', { length: 64 }).primaryKey(),
  number: int('number').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  subtitle: text('subtitle').notNull(),
  color: varchar('color', { length: 32 }).notNull(),
  sortOrder: int('sort_order').notNull(),
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
  updatedAt: datetime('updated_at', { mode: 'date', fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
}, (table) => [uniqueIndex('levels_number_uq').on(table.number)]);

export const modules = mysqlTable('modules', {
  id: varchar('id', { length: 96 }).primaryKey(),
  number: int('number').notNull(),
  levelId: varchar('level_id', { length: 64 }).notNull().references(() => levels.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  sortOrder: int('sort_order').notNull(),
  readiness: mysqlEnum('readiness', ['ready', 'planned']).notNull().default('planned'),
  isPublished: boolean('is_published').notNull().default(false),
  draftContent: json('draft_content').$type<ModuleSnapshot>().notNull(),
  publishedContent: json('published_content').$type<ModuleSnapshot | null>(),
  publishedMetadata: json('published_metadata').$type<PublishedModuleMetadata | null>(),
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
  updatedAt: datetime('updated_at', { mode: 'date', fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
}, (table) => [
  uniqueIndex('modules_global_number_uq').on(table.number),
  index('modules_level_order_idx').on(table.levelId, table.sortOrder),
]);

export const glossaryEntries = mysqlTable('glossary_entries', {
  id: varchar('id', { length: 96 }).primaryKey(),
  term: varchar('term', { length: 255 }).notNull(),
  definition: text('definition').notNull(),
  group: varchar('group_name', { length: 128 }).notNull(),
  draftTerm: varchar('draft_term', { length: 255 }),
  draftDefinition: text('draft_definition'),
  draftGroup: varchar('draft_group', { length: 128 }),
  isPublished: boolean('is_published').notNull().default(true),
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
  updatedAt: datetime('updated_at', { mode: 'date', fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
}, (table) => [uniqueIndex('glossary_term_uq').on(table.term)]);

export const adminUsers = mysqlTable('admin_users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 320 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
  updatedAt: datetime('updated_at', { mode: 'date', fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
}, (table) => [uniqueIndex('admin_users_email_uq').on(table.email)]);

export const adminSessions = mysqlTable('admin_sessions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => adminUsers.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 64 }).notNull(),
  csrfTokenHash: varchar('csrf_token_hash', { length: 64 }).notNull(),
  expiresAt: datetime('expires_at', { mode: 'date', fsp: 3 }).notNull(),
  revokedAt: datetime('revoked_at', { mode: 'date', fsp: 3 }),
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
}, (table) => [
  uniqueIndex('admin_sessions_token_hash_uq').on(table.tokenHash),
  index('admin_sessions_user_expiry_idx').on(table.userId, table.expiresAt),
]);

export const contentMigrations = mysqlTable('content_migrations', {
  key: varchar('key_name', { length: 191 }).primaryKey(),
  appliedAt: datetime('applied_at', { mode: 'date', fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
  metadata: json('metadata').$type<Record<string, unknown> | null>(),
});

export const schema = { levels, modules, glossaryEntries, adminUsers, adminSessions, contentMigrations };
