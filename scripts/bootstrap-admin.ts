import { randomUUID } from 'node:crypto';
import { hashPassword } from '../server/lib/security.js';
import { adminUsers } from '../server/db/schema.js';
import { db, pool } from '../server/db/client.js';

try {
  const [existing] = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1);
  if (existing) {
    console.log('Administrator bootstrap skipped: an administrator already exists.');
  } else {
    const email = process.env.TRILHA_ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.TRILHA_ADMIN_PASSWORD;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12) {
      throw new Error('Set a valid TRILHA_ADMIN_EMAIL and a TRILHA_ADMIN_PASSWORD of at least 12 characters.');
    }
    const passwordHash = await hashPassword(password);
    await db.insert(adminUsers).values({ id: randomUUID(), email, passwordHash });
    console.log('Administrator bootstrap completed.');
  }
} finally {
  await pool.end();
}
