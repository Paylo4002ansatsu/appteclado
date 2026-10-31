import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'mysql',
  schema: './server/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL ?? 'mysql://migration:unset@127.0.0.1:3306/trilha_do_teclado' },
  strict: true,
  verbose: true,
});
