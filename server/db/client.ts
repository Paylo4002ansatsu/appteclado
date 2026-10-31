import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { schema } from './schema.js';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL precisa estar definido no ambiente de runtime.');

const pool = mysql.createPool(databaseUrl);
export const db = drizzle(pool, { schema, mode: 'default' });
export { pool };
