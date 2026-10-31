import { createHash, randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import express, { type NextFunction, type Request, type Response } from 'express';
import { and, asc, eq, gt, inArray, isNull, ne, sql } from 'drizzle-orm';
import { ZodError, z } from 'zod';
import type { AdminGlossaryRecord, AdminModuleRecord, GlossaryDraftContent, ModuleSnapshot, PublishedModuleMetadata, PublicCourseResponse, PublicLevelData } from '../src/data/courseTypes.js';
import { adminSessions, adminUsers, glossaryEntries, levels, modules } from './db/schema.js';
import { db, pool } from './db/client.js';
import { glossaryInputSchema, moduleSnapshotSchema, moduleMetadataSchema, parseModuleSnapshot } from './lib/content.js';
import { clearAuthCookies, constantTimeStringEqual, CSRF_COOKIE, getCookie, hashPassword, randomToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, setCsrfCookie, setSessionCookie, sha256, verifyPassword } from './lib/security.js';

const app = express();
const port = Number(process.env.PORT ?? 3000);
const jsonLimit = process.env.API_JSON_LIMIT ?? '3mb';
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: jsonLimit }));

function asIso(value: Date | string): string {
  return (value instanceof Date ? value : new Date(value)).toISOString();
}
function decodeJson<T>(value: T | string): T {
  return (typeof value === 'string' ? JSON.parse(value) : value) as T;
}
function pendingChanges(row: typeof modules.$inferSelect): boolean {
  const draftMetadata: PublishedModuleMetadata = { levelId: row.levelId, number: row.number, sortOrder: row.sortOrder, readiness: row.readiness };
  const publishedMetadata = row.publishedMetadata ? decodeJson(row.publishedMetadata) : null;
  return JSON.stringify(decodeJson(row.draftContent)) !== JSON.stringify(decodeJson(row.publishedContent ?? null))
    || JSON.stringify(draftMetadata) !== JSON.stringify(publishedMetadata);
}
function adminRecord(row: typeof modules.$inferSelect): AdminModuleRecord {
  return {
    id: row.id,
    number: row.number,
    levelId: row.levelId,
    sortOrder: row.sortOrder,
    readiness: row.readiness,
    isPublished: row.isPublished,
    draftContent: parseModuleSnapshot(decodeJson(row.draftContent), row.id),
    publishedContent: row.publishedContent ? parseModuleSnapshot(decodeJson(row.publishedContent), row.id) : null,
    hasPendingChanges: pendingChanges(row),
    createdAt: asIso(row.createdAt),
    updatedAt: asIso(row.updatedAt),
  };
}
function stableGlossaryId(term: string): string {
  const normalized = term.normalize('NFKC').trim().toLocaleLowerCase('pt-BR');
  return `glossary-${createHash('sha256').update(normalized).digest('hex').slice(0, 24)}`;
}
function normalizedGlossaryTerm(term: string): string {
  return term.normalize('NFKC').trim().toLocaleLowerCase('pt-BR');
}
async function hasGlossaryTermConflict(term: string, exceptId?: string): Promise<boolean> {
  const expected = normalizedGlossaryTerm(term);
  const rows = await db.select({ id: glossaryEntries.id, term: glossaryEntries.term, draftTerm: glossaryEntries.draftTerm }).from(glossaryEntries);
  return rows.some((row) => row.id !== exceptId && [row.term, row.draftTerm].some((value) => value && normalizedGlossaryTerm(value) === expected));
}
function adminGlossaryRecord(row: typeof glossaryEntries.$inferSelect): AdminGlossaryRecord {
  const draftContent: GlossaryDraftContent = {
    term: row.draftTerm ?? row.term,
    definition: row.draftDefinition ?? row.definition,
    group: row.draftGroup ?? row.group,
  };
  const publishedContent: GlossaryDraftContent | null = row.isPublished
    ? { term: row.term, definition: row.definition, group: row.group }
    : null;
  return {
    id: row.id,
    draftContent,
    publishedContent,
    isPublished: row.isPublished,
    hasPendingChanges: !publishedContent || JSON.stringify(draftContent) !== JSON.stringify(publishedContent),
    createdAt: asIso(row.createdAt),
    updatedAt: asIso(row.updatedAt),
  };
}
function sendApiError(response: Response, status: number, message: string): void {
  response.status(status).json({ error: message });
}
function routeParam(request: Request, name: string): string {
  const value = request.params[name];
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}
type AuthContext = { userId: string; email: string; sessionId: string; tokenHash: string; csrfTokenHash: string };
type AuthRequest = Request & { adminAuth?: AuthContext };

const loginFailures = new Map<string, { count: number; resetAt: number }>();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LIMIT = 5;
function loginFailureKey(request: Request, email: string): string {
  return `${request.ip ?? 'unknown'}:${email.trim().toLowerCase()}`;
}
function blockedLogin(request: Request, email: string): number | null {
  const entry = loginFailures.get(loginFailureKey(request, email));
  if (!entry) return null;
  if (entry.resetAt <= Date.now()) { loginFailures.delete(loginFailureKey(request, email)); return null; }
  return entry.count >= LOGIN_LIMIT ? Math.max(1, Math.ceil((entry.resetAt - Date.now()) / 1000)) : null;
}
function countLoginFailure(request: Request, email: string): void {
  const key = loginFailureKey(request, email);
  const existing = loginFailures.get(key);
  if (!existing || existing.resetAt <= Date.now()) loginFailures.set(key, { count: 1, resetAt: Date.now() + LOGIN_WINDOW_MS });
  else existing.count += 1;
}

async function requireAuth(request: Request, response: Response, next: NextFunction): Promise<void> {
  const pathname = request.originalUrl.split('?')[0] ?? '';
  const known = (request.method === 'GET' && /^\/api\/admin\/(modules(?:\/[^/]+)?|glossary)$/.test(pathname))
    || (request.method === 'POST' && /^\/api\/admin\/(modules|modules\/[^/]+\/(?:publish|unpublish)|videos\/[^/]+\/move|glossary(?:\/[^/]+\/(?:publish|unpublish))?|auth\/(?:logout|password))$/.test(pathname))
    || (request.method === 'PUT' && /^\/api\/admin\/(modules\/reorder|modules\/[^/]+(?:\/draft)?|glossary\/[^/]+)$/.test(pathname))
    || (request.method === 'DELETE' && /^\/api\/admin\/(modules\/[^/]+|glossary\/[^/]+)$/.test(pathname));
  if (!known) { next(); return; }
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) { sendApiError(response, 401, 'Autenticação necessária.'); return; }
  const tokenHash = sha256(token);
  const [row] = await db.select({
    sessionId: adminSessions.id,
    userId: adminSessions.userId,
    email: adminUsers.email,
    csrfTokenHash: adminSessions.csrfTokenHash,
  }).from(adminSessions).innerJoin(adminUsers, eq(adminSessions.userId, adminUsers.id))
    .where(and(eq(adminSessions.tokenHash, tokenHash), isNull(adminSessions.revokedAt), gt(adminSessions.expiresAt, new Date()))).limit(1);
  if (!row) { clearAuthCookies(response); sendApiError(response, 401, 'Sessão expirada.'); return; }
  (request as AuthRequest).adminAuth = { userId: row.userId, email: row.email, sessionId: row.sessionId, tokenHash, csrfTokenHash: row.csrfTokenHash };
  next();
}
function requireCsrf(request: Request, response: Response, next: NextFunction): void {
  const context = (request as AuthRequest).adminAuth;
  const csrf = getCookie(request, CSRF_COOKIE);
  const header = request.header('x-csrf-token');
  if (!context || !csrf || !header || !constantTimeStringEqual(csrf, header) || !constantTimeStringEqual(sha256(csrf), context.csrfTokenHash)) {
    sendApiError(response, 403, 'Token CSRF ausente ou inválido.');
    return;
  }
  next();
}

app.get('/api/health', async (_request, response, next) => {
  try {
    await db.execute(sql`SELECT 1`);
    response.status(200).json({ ok: true });
  } catch (error) { next(error); }
});

app.get('/api/public/course', async (_request, response, next) => {
  try {
    response.setHeader('Cache-Control', 'no-store');
    const [levelRows, moduleRows, glossaryRows] = await Promise.all([
      db.select().from(levels).orderBy(asc(levels.sortOrder), asc(levels.number)),
      db.select().from(modules).orderBy(asc(modules.sortOrder), asc(modules.number)),
      db.select().from(glossaryEntries).where(eq(glossaryEntries.isPublished, true)).orderBy(asc(glossaryEntries.term)),
    ]);
    const publishedModules = moduleRows.filter((module) => module.isPublished && module.publishedContent !== null).map((module) => {
      const metadata: PublishedModuleMetadata = module.publishedMetadata
        ? decodeJson(module.publishedMetadata)
        : { levelId: module.levelId, number: module.number, sortOrder: module.sortOrder, readiness: module.readiness };
      return {
        ...parseModuleSnapshot(decodeJson(module.publishedContent!), module.id),
        id: module.id, number: metadata.number, levelId: metadata.levelId,
        sortOrder: metadata.sortOrder, readiness: metadata.readiness, isPublished: true as const,
      };
    });
    const publicLevels: PublicLevelData[] = levelRows.map((level) => ({
      id: level.id, number: level.number, title: level.title, subtitle: level.subtitle,
      color: level.color, sortOrder: level.sortOrder,
      modules: publishedModules.filter((module) => module.levelId === level.id).sort((a, b) => a.sortOrder - b.sortOrder || a.number - b.number),
    }));
    const publicGlossary = glossaryRows.map(({ id, term, definition, group }) => ({ id, term, definition, group }));
    const version = createHash('sha256').update(JSON.stringify([publicLevels, publicGlossary])).digest('hex');
    const result: PublicCourseResponse = { version, levels: publicLevels, glossary: publicGlossary };
    response.json(result);
  } catch (error) { next(error); }
});

app.get('/api/admin/auth/csrf', (_request, response) => {
  const token = randomToken();
  setCsrfCookie(response, token);
  response.setHeader('Cache-Control', 'no-store');
  response.json({ csrfToken: token });
});

app.post('/api/admin/auth/login', async (request, response, next) => {
  try {
    const csrfCookie = getCookie(request, CSRF_COOKIE);
    const csrfHeader = request.header('x-csrf-token');
    if (!csrfCookie || !csrfHeader || !constantTimeStringEqual(csrfCookie, csrfHeader)) { sendApiError(response, 403, 'Token CSRF ausente ou inválido.'); return; }
    const input = z.object({ email: z.string().trim().email().max(320), password: z.string().min(1).max(1024) }).safeParse(request.body);
    if (!input.success) { sendApiError(response, 400, 'E-mail ou senha inválidos.'); return; }
    const email = input.data.email.toLowerCase();
    const waitSeconds = blockedLogin(request, email);
    if (waitSeconds !== null) { response.setHeader('Retry-After', String(waitSeconds)); sendApiError(response, 429, 'Muitas tentativas. Tente novamente mais tarde.'); return; }
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    const valid = user ? await verifyPassword(input.data.password, user.passwordHash) : false;
    if (!user || !valid) { countLoginFailure(request, email); sendApiError(response, 401, 'E-mail ou senha inválidos.'); return; }
    loginFailures.delete(loginFailureKey(request, email));
    const rawToken = randomToken();
    const tokenHash = sha256(rawToken);
    const csrfTokenHash = sha256(csrfCookie);
    await db.insert(adminSessions).values({
      id: randomUUID(), userId: user.id, tokenHash, csrfTokenHash,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
    });
    setSessionCookie(response, rawToken);
    response.setHeader('Cache-Control', 'no-store');
    response.json({ authenticated: true, email: user.email, csrfToken: csrfCookie });
  } catch (error) { next(error); }
});

app.get('/api/admin/auth/session', async (request, response, next) => {
  try {
    response.setHeader('Cache-Control', 'no-store');
    const token = getCookie(request, SESSION_COOKIE);
    if (!token) { response.json({ authenticated: false }); return; }
    const tokenHash = sha256(token);
    const [row] = await db.select({ sessionId: adminSessions.id, email: adminUsers.email, csrfTokenHash: adminSessions.csrfTokenHash })
      .from(adminSessions).innerJoin(adminUsers, eq(adminSessions.userId, adminUsers.id))
      .where(and(eq(adminSessions.tokenHash, tokenHash), isNull(adminSessions.revokedAt), gt(adminSessions.expiresAt, new Date()))).limit(1);
    if (!row) { clearAuthCookies(response); response.json({ authenticated: false }); return; }
    let csrfToken = getCookie(request, CSRF_COOKIE) ?? '';
    if (!csrfToken || !constantTimeStringEqual(sha256(csrfToken), row.csrfTokenHash)) {
      csrfToken = randomToken();
      await db.update(adminSessions).set({ csrfTokenHash: sha256(csrfToken) }).where(eq(adminSessions.id, row.sessionId));
      setCsrfCookie(response, csrfToken);
    }
    response.json({ authenticated: true, email: row.email, csrfToken });
  } catch (error) { next(error); }
});

app.use('/api/admin', requireAuth);
app.post('/api/admin/auth/logout', requireCsrf, async (request, response, next) => {
  try {
    const context = (request as AuthRequest).adminAuth!;
    await db.update(adminSessions).set({ revokedAt: new Date() }).where(eq(adminSessions.id, context.sessionId));
    clearAuthCookies(response);
    response.status(204).end();
  } catch (error) { next(error); }
});
app.post('/api/admin/auth/password', requireCsrf, async (request, response, next) => {
  try {
    const input = z.object({ currentPassword: z.string().min(1).max(1024), newPassword: z.string().min(12).max(1024) }).safeParse(request.body);
    if (!input.success) { sendApiError(response, 400, 'A nova senha precisa ter pelo menos 12 caracteres.'); return; }
    const context = (request as AuthRequest).adminAuth!;
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, context.userId)).limit(1);
    if (!user || !(await verifyPassword(input.data.currentPassword, user.passwordHash))) { sendApiError(response, 400, 'Senha atual incorreta.'); return; }
    const passwordHash = await hashPassword(input.data.newPassword);
    await db.transaction(async (tx) => {
      await tx.update(adminUsers).set({ passwordHash, updatedAt: new Date() }).where(eq(adminUsers.id, context.userId));
      await tx.update(adminSessions).set({ revokedAt: new Date() }).where(and(eq(adminSessions.userId, context.userId), ne(adminSessions.id, context.sessionId), isNull(adminSessions.revokedAt)));
    });
    response.status(204).end();
  } catch (error) { next(error); }
});

app.get('/api/admin/modules', async (_request, response, next) => {
  try {
    const rows = await db.select().from(modules).orderBy(asc(modules.levelId), asc(modules.sortOrder), asc(modules.number));
    response.json(rows.map((row) => ({
      ...adminRecord(row),
      title: decodeJson(row.draftContent).title,
      description: decodeJson(row.draftContent).description,
    })));
  } catch (error) { next(error); }
});
app.get('/api/admin/modules/:id', async (request, response, next) => {
  try {
    const [row] = await db.select().from(modules).where(eq(modules.id, routeParam(request, 'id'))).limit(1);
    if (!row) { sendApiError(response, 404, 'Módulo não encontrado.'); return; }
    response.json(adminRecord(row));
  } catch (error) { next(error); }
});
app.post('/api/admin/modules', requireCsrf, async (request, response, next) => {
  try {
    const input = z.object({
      id: z.string().trim().min(2).max(96).regex(/^[a-z0-9][a-z0-9_-]+$/).optional(),
      number: z.number().int().positive().max(100000).optional(), levelId: z.string().trim().min(1).max(64),
      sortOrder: z.number().int().min(0).max(100000).optional(), readiness: z.enum(['ready', 'planned']).default('planned'),
      draftContent: moduleSnapshotSchema.optional(),
    }).safeParse(request.body);
    if (!input.success) { sendApiError(response, 400, input.error.issues[0]?.message ?? 'Dados inválidos.'); return; }
    const id = input.data.id ?? `custom-${randomUUID()}`;
    const [level] = await db.select({ id: levels.id }).from(levels).where(eq(levels.id, input.data.levelId)).limit(1);
    if (!level) { sendApiError(response, 400, 'Nível inexistente.'); return; }
    const [numberRow] = await db.select({ maximum: sql<number>`COALESCE(MAX(${modules.number}), 0)` }).from(modules);
    const [orderRow] = await db.select({ maximum: sql<number>`COALESCE(MAX(${modules.sortOrder}), 0)` }).from(modules).where(eq(modules.levelId, input.data.levelId));
    const number = input.data.number ?? Number(numberRow?.maximum ?? 0) + 1;
    const sortOrder = input.data.sortOrder ?? Number(orderRow?.maximum ?? 0) + 1;
    const snapshot = parseModuleSnapshot(input.data.draftContent ?? { title: 'Novo módulo', description: '', topics: [], quiz: [] }, id);
    await db.insert(modules).values({
      id, number, levelId: input.data.levelId, sortOrder,
      readiness: input.data.readiness, isPublished: false, draftContent: snapshot, publishedContent: null,
    });
    const [row] = await db.select().from(modules).where(eq(modules.id, id)).limit(1);
    response.status(201).json(adminRecord(row!));
  } catch (error) { next(error); }
});
app.put('/api/admin/modules/:id', requireCsrf, async (request, response, next) => {
  if (routeParam(request, 'id') === 'reorder') { next(); return; }
  try {
    const metadataSchema = moduleMetadataSchema.partial().extend({ title: z.string().trim().min(1).max(255).optional(), description: z.string().max(100000).optional() }).refine((value) => Object.keys(value).length > 0, 'Informe pelo menos um campo.');
    const input = metadataSchema.safeParse(request.body);
    if (!input.success) { sendApiError(response, 400, input.error.issues[0]?.message ?? 'Metadados inválidos.'); return; }
    const [current] = await db.select().from(modules).where(eq(modules.id, routeParam(request, 'id'))).limit(1);
    if (!current) { sendApiError(response, 404, 'Módulo não encontrado.'); return; }
    if (input.data.levelId) {
      const [level] = await db.select({ id: levels.id }).from(levels).where(eq(levels.id, input.data.levelId)).limit(1);
      if (!level) { sendApiError(response, 400, 'Nível inexistente.'); return; }
    }
    const update: Partial<typeof modules.$inferInsert> = {};
    for (const key of ['number', 'levelId', 'sortOrder', 'readiness'] as const) if (input.data[key] !== undefined) update[key] = input.data[key] as never;
    if (input.data.title !== undefined || input.data.description !== undefined) {
      const content = decodeJson(current.draftContent);
      update.draftContent = parseModuleSnapshot({ ...content, ...(input.data.title !== undefined ? { title: input.data.title } : {}), ...(input.data.description !== undefined ? { description: input.data.description } : {}) }, current.id);
    }
    update.updatedAt = new Date();
    await db.update(modules).set(update).where(eq(modules.id, current.id));
    const [row] = await db.select().from(modules).where(eq(modules.id, current.id)).limit(1);
    response.json(adminRecord(row!));
  } catch (error) { next(error); }
});
app.put('/api/admin/modules/:id/draft', requireCsrf, async (request, response, next) => {
  try {
    const input = request.body && typeof request.body === 'object' && 'draftContent' in request.body ? request.body.draftContent : request.body;
    const snapshot = parseModuleSnapshot(input, routeParam(request, 'id'));
    await db.update(modules).set({ draftContent: snapshot, updatedAt: new Date() }).where(eq(modules.id, routeParam(request, 'id')));
    const [row] = await db.select().from(modules).where(eq(modules.id, routeParam(request, 'id'))).limit(1);
    if (!row) { sendApiError(response, 404, 'Módulo não encontrado.'); return; }
    response.json(adminRecord(row));
  } catch (error) { next(error); }
});
app.post('/api/admin/modules/:id/publish', requireCsrf, async (request, response, next) => {
  try {
    let result: typeof modules.$inferSelect | undefined;
    await db.transaction(async (tx) => {
      const [row] = await tx.select().from(modules).where(eq(modules.id, routeParam(request, 'id'))).limit(1).for('update');
      if (!row) return;
      const snapshot = parseModuleSnapshot(decodeJson(row.draftContent), row.id);
      const publishedMetadata: PublishedModuleMetadata = { levelId: row.levelId, number: row.number, sortOrder: row.sortOrder, readiness: row.readiness };
      await tx.update(modules).set({ publishedContent: snapshot, publishedMetadata, isPublished: true, updatedAt: new Date() }).where(eq(modules.id, row.id));
      [result] = await tx.select().from(modules).where(eq(modules.id, row.id)).limit(1);
    });
    if (!result) { sendApiError(response, 404, 'Módulo não encontrado.'); return; }
    response.json(adminRecord(result));
  } catch (error) { next(error); }
});
app.post('/api/admin/modules/:id/unpublish', requireCsrf, async (request, response, next) => {
  try {
    const changed = await db.update(modules).set({ isPublished: false, updatedAt: new Date() }).where(eq(modules.id, routeParam(request, 'id')));
    void changed;
    const [row] = await db.select().from(modules).where(eq(modules.id, routeParam(request, 'id'))).limit(1);
    if (!row) { sendApiError(response, 404, 'Módulo não encontrado.'); return; }
    response.json(adminRecord(row));
  } catch (error) { next(error); }
});
app.delete('/api/admin/modules/:id', requireCsrf, async (request, response, next) => {
  try {
    const [row] = await db.select({ id: modules.id }).from(modules).where(eq(modules.id, routeParam(request, 'id'))).limit(1);
    if (!row) { sendApiError(response, 404, 'Módulo não encontrado.'); return; }
    await db.delete(modules).where(eq(modules.id, routeParam(request, 'id')));
    response.status(204).end();
  } catch (error) { next(error); }
});
app.put('/api/admin/modules/reorder', requireCsrf, async (request, response, next) => {
  try {
    const input = z.object({ items: z.array(z.object({ id: z.string().min(1).max(96), levelId: z.string().min(1).max(64), sortOrder: z.number().int().min(0).max(100000) })).min(1).max(500) }).safeParse(request.body);
    if (!input.success) { sendApiError(response, 400, input.error.issues[0]?.message ?? 'Ordenação inválida.'); return; }
    const ids = input.data.items.map((item) => item.id);
    if (new Set(ids).size !== ids.length) { sendApiError(response, 400, 'IDs duplicados na ordenação.'); return; }
    await db.transaction(async (tx) => {
      const current = await tx.select().from(modules).where(inArray(modules.id, ids)).for('update');
      if (current.length !== ids.length) throw new Error('Módulo não encontrado na ordenação.');
      const levelIds = [...new Set(input.data.items.map((item) => item.levelId))];
      const matchingLevels = await tx.select({ id: levels.id }).from(levels).where(inArray(levels.id, levelIds));
      if (matchingLevels.length !== levelIds.length) throw new Error('Nível inexistente na ordenação.');
      for (const item of input.data.items) {
        await tx.update(modules).set({
          levelId: item.levelId,
          sortOrder: item.sortOrder,
          updatedAt: new Date(),
        }).where(eq(modules.id, item.id));
      }
    });
    const rows = await db.select().from(modules).orderBy(asc(modules.levelId), asc(modules.sortOrder), asc(modules.number));
    response.json(rows.map(adminRecord));
  } catch (error) { next(error); }
});

app.post('/api/admin/videos/:videoId/move', requireCsrf, async (request, response, next) => {
  try {
    const input = z.object({ sourceModuleId: z.string().min(1).max(96), targetModuleId: z.string().min(1).max(96), targetTopicId: z.string().min(1).max(128), sortOrder: z.number().int().min(0).max(10000).optional() }).safeParse(request.body);
    if (!input.success) { sendApiError(response, 400, input.error.issues[0]?.message ?? 'Destino inválido.'); return; }
    const moved = await db.transaction(async (tx) => {
      const moduleIds = [...new Set([input.data.sourceModuleId, input.data.targetModuleId])];
      const locked = await tx.select().from(modules).where(inArray(modules.id, moduleIds)).for('update');
      if (locked.length !== moduleIds.length) throw new Error('Módulo de origem ou destino não encontrado.');
      const byId = new Map(locked.map((row) => [row.id, row]));
      const sourceRow = byId.get(input.data.sourceModuleId)!;
      const targetRow = byId.get(input.data.targetModuleId)!;
      const sourceSnapshot = parseModuleSnapshot(decodeJson(sourceRow.draftContent), sourceRow.id);
      const targetSnapshot = sourceRow.id === targetRow.id ? sourceSnapshot : parseModuleSnapshot(decodeJson(targetRow.draftContent), targetRow.id);
      let found: ModuleSnapshot['topics'][number]['videos'][number] | undefined;
      for (const topic of sourceSnapshot.topics) {
        const videoIndex = topic.videos.findIndex((video) => video.id === routeParam(request, 'videoId'));
        if (videoIndex >= 0) [found] = topic.videos.splice(videoIndex, 1);
      }
      if (!found) throw new Error('Vídeo não encontrado no módulo de origem.');
      const targetTopic = targetSnapshot.topics.find((topic) => topic.id === input.data.targetTopicId);
      if (!targetTopic) throw new Error('Tópico de destino não encontrado.');
      const sortOrder = input.data.sortOrder ?? targetTopic.videos.length;
      const movedVideo = { ...found, moduleId: targetRow.id, topicId: targetTopic.id, topic: targetTopic.title, sortOrder };
      targetTopic.videos.push(movedVideo);
      const validatedSource = parseModuleSnapshot(sourceSnapshot, sourceRow.id);
      const validatedTarget = parseModuleSnapshot(targetSnapshot, targetRow.id);
      if (sourceRow.id === targetRow.id) await tx.update(modules).set({ draftContent: validatedTarget, updatedAt: new Date() }).where(eq(modules.id, sourceRow.id));
      else {
        await tx.update(modules).set({ draftContent: validatedSource, updatedAt: new Date() }).where(eq(modules.id, sourceRow.id));
        await tx.update(modules).set({ draftContent: validatedTarget, updatedAt: new Date() }).where(eq(modules.id, targetRow.id));
      }
      return movedVideo;
    });
    response.json(moved);
  } catch (error) { next(error); }
});

app.get('/api/admin/glossary', async (_request, response, next) => {
  try {
    const rows = await db.select().from(glossaryEntries).orderBy(asc(glossaryEntries.term));
    response.json(rows.map(adminGlossaryRecord));
  }
  catch (error) { next(error); }
});
app.post('/api/admin/glossary', requireCsrf, async (request, response, next) => {
  try {
    const input = glossaryInputSchema.safeParse(request.body);
    if (!input.success) { sendApiError(response, 400, input.error.issues[0]?.message ?? 'Entrada inválida.'); return; }
    if (await hasGlossaryTermConflict(input.data.term)) { sendApiError(response, 409, 'Já existe um termo igual publicado ou em rascunho.'); return; }
    const id = stableGlossaryId(input.data.term);
    await db.insert(glossaryEntries).values({
      id, term: `__draft__${id}`, definition: '', group: '',
      draftTerm: input.data.term, draftDefinition: input.data.definition, draftGroup: input.data.group,
      isPublished: false,
    });
    const [row] = await db.select().from(glossaryEntries).where(eq(glossaryEntries.id, id)).limit(1);
    response.status(201).json(adminGlossaryRecord(row!));
  } catch (error) { next(error); }
});
app.put('/api/admin/glossary/:id', requireCsrf, async (request, response, next) => {
  try {
    const input = glossaryInputSchema.safeParse(request.body);
    if (!input.success) { sendApiError(response, 400, input.error.issues[0]?.message ?? 'Entrada inválida.'); return; }
    const id = routeParam(request, 'id');
    const [existing] = await db.select({ id: glossaryEntries.id }).from(glossaryEntries).where(eq(glossaryEntries.id, id)).limit(1);
    if (!existing) { sendApiError(response, 404, 'Entrada não encontrada.'); return; }
    if (await hasGlossaryTermConflict(input.data.term, id)) { sendApiError(response, 409, 'Já existe um termo igual publicado ou em rascunho.'); return; }
    await db.update(glossaryEntries).set({
      draftTerm: input.data.term, draftDefinition: input.data.definition, draftGroup: input.data.group,
      updatedAt: new Date(),
    }).where(eq(glossaryEntries.id, id));
    const [row] = await db.select().from(glossaryEntries).where(eq(glossaryEntries.id, id)).limit(1);
    if (!row) { sendApiError(response, 404, 'Entrada não encontrada.'); return; }
    response.json(adminGlossaryRecord(row));
  } catch (error) { next(error); }
});
app.post('/api/admin/glossary/:id/publish', requireCsrf, async (request, response, next) => {
  try {
    const id = routeParam(request, 'id');
    const [row] = await db.select().from(glossaryEntries).where(eq(glossaryEntries.id, id)).limit(1);
    if (!row) { sendApiError(response, 404, 'Entrada não encontrada.'); return; }
    const input = glossaryInputSchema.safeParse({
      term: row.draftTerm ?? row.term,
      definition: row.draftDefinition ?? row.definition,
      group: row.draftGroup ?? row.group,
    });
    if (!input.success) { sendApiError(response, 400, input.error.issues[0]?.message ?? 'Entrada inválida.'); return; }
    if (await hasGlossaryTermConflict(input.data.term, id)) { sendApiError(response, 409, 'Já existe um termo igual publicado ou em rascunho.'); return; }
    await db.update(glossaryEntries).set({ ...input.data, isPublished: true, updatedAt: new Date() }).where(eq(glossaryEntries.id, id));
    const [published] = await db.select().from(glossaryEntries).where(eq(glossaryEntries.id, id)).limit(1);
    response.json(adminGlossaryRecord(published!));
  } catch (error) { next(error); }
});
app.post('/api/admin/glossary/:id/unpublish', requireCsrf, async (request, response, next) => {
  try {
    const id = routeParam(request, 'id');
    const [row] = await db.select().from(glossaryEntries).where(eq(glossaryEntries.id, id)).limit(1);
    if (!row) { sendApiError(response, 404, 'Entrada não encontrada.'); return; }
    await db.update(glossaryEntries).set({ isPublished: false, updatedAt: new Date() }).where(eq(glossaryEntries.id, id));
    const [updated] = await db.select().from(glossaryEntries).where(eq(glossaryEntries.id, id)).limit(1);
    response.json(adminGlossaryRecord(updated!));
  } catch (error) { next(error); }
});
app.delete('/api/admin/glossary/:id', requireCsrf, async (request, response, next) => {
  try {
    const [row] = await db.select({ id: glossaryEntries.id }).from(glossaryEntries).where(eq(glossaryEntries.id, routeParam(request, 'id'))).limit(1);
    if (!row) { sendApiError(response, 404, 'Entrada não encontrada.'); return; }
    await db.delete(glossaryEntries).where(eq(glossaryEntries.id, routeParam(request, 'id')));
    response.status(204).end();
  } catch (error) { next(error); }
});

app.use('/api', (_request, response) => sendApiError(response, 404, 'API route not found.'));

const dist = resolve(process.cwd(), 'dist');
app.use(express.static(dist, { index: false, fallthrough: true }));
app.get('*splat', (_request, response, next) => {
  response.sendFile(resolve(dist, 'index.html'), (error) => { if (error) next(error); });
});

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  if (response.headersSent) return;
  if (error instanceof ZodError) { sendApiError(response, 400, error.issues[0]?.message ?? 'Dados inválidos.'); return; }
  const maybe = error as { code?: string; message?: string };
  if (maybe.code === 'ER_DUP_ENTRY') { sendApiError(response, 409, 'Este identificador, número ou termo já existe.'); return; }
  if (maybe.message?.includes('não encontrado') || maybe.message?.includes('Nível inexistente')) { sendApiError(response, 400, maybe.message); return; }
  console.error('Backend request failed:', maybe.message ?? 'unknown error');
  sendApiError(response, 500, 'Erro interno do servidor.');
});

const server = app.listen(port, '0.0.0.0', () => console.log(`Trilha do Teclado backend listening on ${port}`));
const shutdown = async () => {
  server.close(() => undefined);
  await pool.end();
  process.exit(0);
};
process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
