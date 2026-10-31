import type { AdminGlossaryRecord, AdminModuleRecord, AdminSessionResponse, ContentReadiness, GlossaryDraftContent, ModuleSnapshot } from '../data/courseTypes';

const API = '/api/admin';
let csrfToken: string | undefined;

export class AdminApiError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.name = 'AdminApiError'; this.status = status; }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (options.method && !['GET', 'HEAD'].includes(options.method.toUpperCase())) {
    if (!csrfToken) await getCsrfToken();
    if (csrfToken) headers.set('X-CSRF-Token', csrfToken);
  }
  const response = await fetch(`${API}${path}`, { ...options, headers, credentials: 'same-origin' });
  const text = await response.text();
  let payload: unknown = undefined;
  if (text) { try { payload = JSON.parse(text); } catch { payload = text; } }
  if (!response.ok) {
    const body = payload as { error?: string; message?: string } | null;
    throw new AdminApiError(body?.error || body?.message || (typeof payload === 'string' ? payload : `A solicitação falhou (${response.status}).`), response.status);
  }
  return payload as T;
}

export async function getCsrfToken() {
  const result = await request<{ csrfToken: string }>('/auth/csrf');
  csrfToken = result.csrfToken;
  return csrfToken;
}
export async function getSession() {
  const result = await request<AdminSessionResponse>('/auth/session');
  if (result.csrfToken) csrfToken = result.csrfToken;
  return result;
}
export async function login(email: string, password: string) {
  await getCsrfToken();
  const result = await request<AdminSessionResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  if (result.csrfToken) csrfToken = result.csrfToken;
  return result;
}
export async function logout() { await request<void>('/auth/logout', { method: 'POST' }); csrfToken = undefined; }
export const listModules = () => request<AdminModuleRecord[]>('/modules');
export const getModule = (id: string) => request<AdminModuleRecord>(`/modules/${encodeURIComponent(id)}`);
export const createModule = (levelId: string, readiness?: ContentReadiness) => request<AdminModuleRecord>('/modules', { method: 'POST', body: JSON.stringify({ levelId, readiness }) });
export const updateModule = (id: string, body: Pick<AdminModuleRecord, 'levelId' | 'number' | 'sortOrder' | 'readiness'>) => request<AdminModuleRecord>(`/modules/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) });
export const saveDraft = (id: string, content: ModuleSnapshot) => request<AdminModuleRecord>(`/modules/${encodeURIComponent(id)}/draft`, { method: 'PUT', body: JSON.stringify(content) });
export const publishModule = (id: string) => request<AdminModuleRecord>(`/modules/${encodeURIComponent(id)}/publish`, { method: 'POST' });
export const unpublishModule = (id: string) => request<AdminModuleRecord>(`/modules/${encodeURIComponent(id)}/unpublish`, { method: 'POST' });
export const deleteModule = (id: string) => request<void>(`/modules/${encodeURIComponent(id)}`, { method: 'DELETE' });
export const reorderModules = (items: { id: string; levelId: string; sortOrder: number }[]) => request<AdminModuleRecord[]>('/modules/reorder', { method: 'PUT', body: JSON.stringify({ items }) });
export const moveVideo = (videoId: string, sourceModuleId: string, targetModuleId: string, targetTopicId: string) => request<void>(`/videos/${encodeURIComponent(videoId)}/move`, { method: 'POST', body: JSON.stringify({ sourceModuleId, targetModuleId, targetTopicId }) });
export const listGlossary = () => request<AdminGlossaryRecord[]>('/glossary');
export const createGlossary = (body: GlossaryDraftContent) => request<AdminGlossaryRecord>('/glossary', { method: 'POST', body: JSON.stringify(body) });
export const updateGlossary = (id: string, body: GlossaryDraftContent) => request<AdminGlossaryRecord>(`/glossary/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) });
export const publishGlossary = (id: string) => request<AdminGlossaryRecord>(`/glossary/${encodeURIComponent(id)}/publish`, { method: 'POST' });
export const unpublishGlossary = (id: string) => request<AdminGlossaryRecord>(`/glossary/${encodeURIComponent(id)}/unpublish`, { method: 'POST' });
export const deleteGlossary = (id: string) => request<void>(`/glossary/${encodeURIComponent(id)}`, { method: 'DELETE' });
