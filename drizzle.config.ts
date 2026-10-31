import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL precisa estar definido no ambiente para executar Drizzle Kit.');

export default defineConfig({
  dialect: 'mysql',
  schema: './server/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: databaseUrl },
  strict: true,
  verbose: true,
});
