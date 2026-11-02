import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Request, Response } from 'express';
import { app } from '../server/app.js';

const INTERNAL_PATH_QUERY = '__vercel_api_path';
type VercelRequest = IncomingMessage & {
  query?: Record<string, string | string[] | undefined>;
};

export function restoreApiRequestUrl(request: Pick<VercelRequest, 'url' | 'query'>): string | null {
  const parsed = new URL(request.url ?? '/', 'https://vercel.invalid');
  const queryValue = request.query?.[INTERNAL_PATH_QUERY];
  const forwardedPath = parsed.searchParams.get(INTERNAL_PATH_QUERY)
    ?? (typeof queryValue === 'string' ? queryValue : null);
  if (forwardedPath === null) return null;

  parsed.searchParams.delete(INTERNAL_PATH_QUERY);
  const path = forwardedPath.replace(/^\/+/, '');
  if (path && (/[\\?#\u0000]/.test(path) || path.split('/').some((part) => !part || part === '.' || part === '..'))) {
    return null;
  }
  const apiPath = path ? `/api/${path}` : '/api';
  const query = parsed.searchParams.toString();
  return query ? `${apiPath}?${query}` : apiPath;
}

export default function handler(request: VercelRequest, response: ServerResponse): void {
  const restoredUrl = restoreApiRequestUrl(request);
  if (restoredUrl === null) {
    response.statusCode = 404;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.end(JSON.stringify({ error: 'API route not found.' }));
    return;
  }
  request.url = restoredUrl;
  app(request as Request, response as Response);
}
