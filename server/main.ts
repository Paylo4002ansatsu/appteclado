import { app } from './app.js';
import { pool } from './db/client.js';

const port = Number(process.env.PORT ?? 3000);
const server = app.listen(port, '0.0.0.0', () => console.log(`Trilha do Teclado backend listening on ${port}`));
const shutdown = async () => {
  server.close(() => undefined);
  await pool.end();
  process.exit(0);
};
process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
