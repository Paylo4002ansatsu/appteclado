import { randomBytes, scrypt as scryptCallback, createHash, timingSafeEqual } from 'node:crypto';
import type { CookieOptions, Request, Response } from 'express';

function scrypt(password: string, salt: string, length: number, options: { N: number; r: number; p: number; maxmem: number }): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, length, options, (error, derived) => error ? reject(error) : resolve(derived));
  });
}
export const SESSION_COOKIE = 'trilha_admin_session';
export const CSRF_COOKIE = 'trilha_admin_csrf';
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const SCRYPT_MAXMEM = 256 * 1024 * 1024;

const cookieSecureSetting = process.env.APP_COOKIE_SECURE;
if (cookieSecureSetting !== undefined && !['true', 'false'].includes(cookieSecureSetting.toLowerCase())) {
  throw new Error('APP_COOKIE_SECURE deve ser explicitamente true ou false.');
}
const isProductionRuntime = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
export const cookieSecure = cookieSecureSetting === undefined
  ? isProductionRuntime
  : cookieSecureSetting.toLowerCase() === 'true';
const sameSiteSetting = process.env.APP_COOKIE_SAME_SITE?.toLowerCase();
if (sameSiteSetting !== undefined && !['none', 'lax', 'strict'].includes(sameSiteSetting)) {
  throw new Error('APP_COOKIE_SAME_SITE deve ser none, lax ou strict.');
}
const cookieSameSite: 'none' | 'lax' | 'strict' = sameSiteSetting === 'none' || sameSiteSetting === 'lax' || sameSiteSetting === 'strict'
  ? sameSiteSetting
  : isProductionRuntime ? 'strict' : 'lax';
if (cookieSameSite === 'none' && !cookieSecure) {
  throw new Error('APP_COOKIE_SECURE=true é obrigatório quando APP_COOKIE_SAME_SITE=none.');
}
const cookieOptions: CookieOptions = {
  path: '/',
  secure: cookieSecure,
  sameSite: cookieSameSite,
};

export function setSessionCookie(response: Response, token: string): void {
  response.cookie(SESSION_COOKIE, token, { ...cookieOptions, httpOnly: true, maxAge: SESSION_MAX_AGE_SECONDS * 1000 });
}
export function setCsrfCookie(response: Response, token: string): void {
  response.cookie(CSRF_COOKIE, token, { ...cookieOptions, httpOnly: false, maxAge: SESSION_MAX_AGE_SECONDS * 1000 });
}
export function clearAuthCookies(response: Response): void {
  response.clearCookie(SESSION_COOKIE, { ...cookieOptions, httpOnly: true });
  response.clearCookie(CSRF_COOKIE, { ...cookieOptions, httpOnly: false });
}
export function getCookie(request: Request, name: string): string | undefined {
  const raw = request.headers.cookie;
  if (!raw) return undefined;
  for (const part of raw.split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    if (part.slice(0, index).trim() !== name) continue;
    try { return decodeURIComponent(part.slice(index + 1).trim()); } catch { return undefined; }
  }
  return undefined;
}

export function randomToken(): string { return randomBytes(32).toString('base64url'); }
export function sha256(value: string): string { return createHash('sha256').update(value).digest('hex'); }
export function constantTimeStringEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = await scrypt(password, salt, 64, { N: 131072, r: 8, p: 1, maxmem: SCRYPT_MAXMEM }) as Buffer;
  return `scrypt$131072$8$1$${salt}$${derived.toString('hex')}`;
}
export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, nText, rText, pText, salt, expectedHex] = encoded.split('$');
  if (algorithm !== 'scrypt' || !salt || !expectedHex) return false;
  const N = Number(nText); const r = Number(rText); const p = Number(pText);
  if (![N, r, p].every(Number.isInteger) || N < 1024 || N > 131072 || r < 1 || r > 16 || p < 1 || p > 4 || !/^[0-9a-f]{128}$/i.test(expectedHex)) return false;
  const expected = Buffer.from(expectedHex, 'hex');
  const actual = await scrypt(password, salt, expected.length, { N, r, p, maxmem: SCRYPT_MAXMEM }) as Buffer;
  return timingSafeEqual(actual, expected);
}

export function needsPasswordRehash(encoded: string): boolean {
  const [algorithm, nText, rText, pText] = encoded.split('$');
  return algorithm === 'scrypt'
    && Number.isInteger(Number(nText)) && Number.isInteger(Number(rText)) && Number.isInteger(Number(pText))
    && (Number(nText) !== 131072 || Number(rText) !== 8 || Number(pText) !== 1);
}
